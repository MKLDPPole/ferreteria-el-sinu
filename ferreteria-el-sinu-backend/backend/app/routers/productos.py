import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app import models, schemas, cache
from app.security import requerir_rol

router = APIRouter(prefix="/api/productos", tags=["Productos"])


def _producto_a_dict_cache(p: models.Producto) -> dict:
    return {
        "id": str(p.id), "sku": p.sku, "nombre": p.nombre,
        "categoria_id": str(p.categoria_id), "unidad_medida": p.unidad_medida,
        "stock_actual": p.stock_actual, "stock_minimo": p.stock_minimo,
    }


@router.get("", response_model=list[schemas.ProductoOut])
def listar_productos(
    sku: str | None = None,
    nombre: str | None = None,
    categoria_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
    _usuario=Depends(requerir_rol("ADMIN", "VENDEDOR", "BODEGUERO")),
):
    """
    GET /api/productos — filtros opcionales por sku, nombre, categoria_id.
    Si se busca por SKU exacto, primero se intenta responder desde Redis
    (patrón descrito en el Momento 1: decenas de consultas/hora del mostrador).
    """
    if sku and not nombre and not categoria_id:
        en_cache = cache.obtener_stock_cache(sku)
        if en_cache:
            return [schemas.ProductoOut(**en_cache)]

    query = db.query(models.Producto)
    if sku:
        query = query.filter(models.Producto.sku.ilike(f"%{sku}%"))
    if nombre:
        query = query.filter(models.Producto.nombre.ilike(f"%{nombre}%"))
    if categoria_id:
        query = query.filter(models.Producto.categoria_id == categoria_id)

    resultados = query.all()

    # Si fue una búsqueda exacta por SKU, cachear el resultado
    if sku and len(resultados) == 1:
        cache.guardar_stock_cache(sku, _producto_a_dict_cache(resultados[0]))

    return resultados


@router.get("/alertas", response_model=list[schemas.ProductoOut])
def alertas_stock(
    db: Session = Depends(get_db),
    _usuario=Depends(requerir_rol("ADMIN", "BODEGUERO")),
):
    """GET /api/productos/alertas — productos con stock_actual <= stock_minimo."""
    return db.query(models.Producto).filter(
        models.Producto.stock_actual <= models.Producto.stock_minimo
    ).all()


@router.get("/{producto_id}", response_model=schemas.ProductoDetalle)
def obtener_producto(
    producto_id: uuid.UUID,
    db: Session = Depends(get_db),
    _usuario=Depends(requerir_rol("ADMIN", "VENDEDOR", "BODEGUERO")),
):
    producto = db.query(models.Producto).options(
        joinedload(models.Producto.movimientos)
    ).filter(models.Producto.id == producto_id).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    detalle = schemas.ProductoDetalle.model_validate(producto)
    ultimos = sorted(producto.movimientos, key=lambda m: m.fecha, reverse=True)[:10]
    detalle.ultimos_movimientos = [schemas.MovimientoResumen.model_validate(m) for m in ultimos]
    return detalle


@router.post("", response_model=schemas.ProductoOut, status_code=status.HTTP_201_CREATED)
def crear_producto(
    datos: schemas.ProductoCrear,
    db: Session = Depends(get_db),
    _usuario=Depends(requerir_rol("ADMIN")),
):
    categoria = db.query(models.Categoria).filter(models.Categoria.id == datos.categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="La categoría indicada no existe")

    existente = db.query(models.Producto).filter(models.Producto.sku == datos.sku).first()
    if existente:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe un producto con ese SKU")

    nuevo = models.Producto(**datos.model_dump(), stock_actual=0)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/{producto_id}", response_model=schemas.ProductoOut)
def actualizar_producto(
    producto_id: uuid.UUID,
    datos: schemas.ProductoActualizar,
    db: Session = Depends(get_db),
    _usuario=Depends(requerir_rol("ADMIN")),
):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(producto, campo, valor)

    db.commit()
    db.refresh(producto)
    cache.invalidar_stock_cache(producto.sku)
    return producto


@router.delete("/{producto_id}")
def eliminar_producto(
    producto_id: uuid.UUID,
    db: Session = Depends(get_db),
    _usuario=Depends(requerir_rol("ADMIN")),
):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    try:
        db.delete(producto)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar: el producto tiene movimientos históricos asociados",
        )

    cache.invalidar_stock_cache(producto.sku)
    return {"detail": "Producto eliminado correctamente"}
