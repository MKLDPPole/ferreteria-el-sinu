from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, security
from app.security import requerir_rol

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])


@router.post("", response_model=schemas.UsuarioOut, status_code=status.HTTP_201_CREATED)
def crear_usuario(
    datos: schemas.UsuarioCrear,
    db: Session = Depends(get_db),
    _usuario=Depends(requerir_rol("ADMIN")),
):
    existente = db.query(models.Usuario).filter(models.Usuario.username == datos.username).first()
    if existente:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El username ya está en uso")

    nuevo = models.Usuario(
        nombre=datos.nombre,
        username=datos.username,
        password_hash=security.hash_password(datos.password),
        rol=datos.rol,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("", response_model=list[schemas.UsuarioOut])
def listar_usuarios(
    db: Session = Depends(get_db),
    _usuario=Depends(requerir_rol("ADMIN")),
):
    return db.query(models.Usuario).all()
