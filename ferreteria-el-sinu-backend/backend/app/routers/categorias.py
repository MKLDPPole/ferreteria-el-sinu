from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.security import requerir_rol

router = APIRouter(prefix="/api/categorias", tags=["Categorías"])


@router.get("", response_model=list[schemas.CategoriaOut])
def listar_categorias(
    db: Session = Depends(get_db),
    _usuario=Depends(requerir_rol("ADMIN", "VENDEDOR", "BODEGUERO")),
):
    return db.query(models.Categoria).all()


@router.post("", response_model=schemas.CategoriaOut, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    nombre: str,
    db: Session = Depends(get_db),
    _usuario=Depends(requerir_rol("ADMIN")),
):
    if db.query(models.Categoria).filter(models.Categoria.nombre == nombre).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La categoría ya existe")
    nueva = models.Categoria(nombre=nombre)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva
