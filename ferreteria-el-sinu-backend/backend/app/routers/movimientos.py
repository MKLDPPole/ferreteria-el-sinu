import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, cache
from app.security import requerir_rol

router = APIRouter(prefix="/api/movimientos", tags=["Movimientos"])


@router.post("", response_model=schemas.MovimientoCreadoOut, status_code=status.HTTP_201_CREATED)
def registrar_movimiento(
    datos: schemas.MovimientoCrear,
    db: Session = Depends(get_db),
    _usuario=Depends(requerir_rol("ADMIN", "VENDEDOR", "BODEGUERO")),
):
    """
    POST /api/movimientos
    Transacción atómica (ACID, tal como se justificó en el Momento 1):
    o se actualiza stock_actual Y se inserta el movimiento, o no ocurre nada.

    Validaciones de negocio (Momento 3, punto 1):
      - El producto debe existir (404 si no).
      - Una SALIDA no puede dejar el stock en negativo (400 si ocurre).
    """
    producto = db.query(models.Producto).filter(models.Producto.id == datos.producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no existente")

    usuario = db.query(models.Usuario).filter(models.Usuario.id == datos.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no existente")

    if datos.tipo == models.TipoMovimiento.SALIDA:
        nuevo_stock = producto.stock_actual - datos.cantidad
    elif datos.tipo == models.TipoMovimiento.ENTRADA:
        nuevo_stock = producto.stock_actual + datos.cantidad
    else:  # AJUSTE: la cantidad representa el nuevo stock absoluto
        nuevo_stock = datos.cantidad

    if nuevo_stock < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente: hay {producto.stock_actual} unidades, "
                   f"no se pueden retirar {datos.cantidad}",
        )

    try:
        movimiento = models.Movimiento(
            producto_id=producto.id,
            usuario_id=usuario.id,
            tipo=datos.tipo,
            cantidad=datos.cantidad,
            fecha=datetime.utcnow(),
        )
        producto.stock_actual = nuevo_stock
        db.add(movimiento)
        db.commit()
        db.refresh(movimiento)
        db.refresh(producto)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="No se pudo registrar el movimiento, se revirtieron los cambios")

    # Invalidar caché de ese SKU (flujo de escritura descrito en el Momento 2)
    cache.invalidar_stock_cache(producto.sku)

    alerta = producto.stock_actual <= producto.stock_minimo

    return schemas.MovimientoCreadoOut(
        movimiento=movimiento,
        stock_resultante=producto.stock_actual,
        alerta_generada=alerta,
    )


@router.get("", response_model=list[schemas.MovimientoOut])
def listar_movimientos(
    producto_id: uuid.UUID | None = None,
    desde: datetime | None = None,
    hasta: datetime | None = None,
    db: Session = Depends(get_db),
    _usuario=Depends(requerir_rol("ADMIN", "VENDEDOR", "BODEGUERO")),
):
    query = db.query(models.Movimiento)
    if producto_id:
        query = query.filter(models.Movimiento.producto_id == producto_id)
    if desde:
        query = query.filter(models.Movimiento.fecha >= desde)
    if hasta:
        query = query.filter(models.Movimiento.fecha <= hasta)
    return query.order_by(models.Movimiento.fecha.desc()).all()
