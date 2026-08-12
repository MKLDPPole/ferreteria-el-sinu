import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict

from app.models import RolUsuario, TipoMovimiento


# ---------- Categoría ----------
class CategoriaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    nombre: str


# ---------- Usuario ----------
class UsuarioCrear(BaseModel):
    nombre: str
    username: str
    password: str = Field(min_length=6)
    rol: RolUsuario


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    nombre: str
    username: str
    rol: RolUsuario


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    token: str
    usuario: UsuarioOut


# ---------- Producto ----------
class ProductoCrear(BaseModel):
    sku: str
    nombre: str
    categoria_id: uuid.UUID
    unidad_medida: str
    stock_minimo: int = Field(ge=0, default=0)


class ProductoActualizar(BaseModel):
    nombre: Optional[str] = None
    stock_minimo: Optional[int] = Field(default=None, ge=0)


class ProductoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    sku: str
    nombre: str
    categoria_id: uuid.UUID
    unidad_medida: str
    stock_actual: int
    stock_minimo: int


class MovimientoResumen(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tipo: TipoMovimiento
    cantidad: int
    fecha: datetime
    usuario_id: uuid.UUID


class ProductoDetalle(ProductoOut):
    ultimos_movimientos: list[MovimientoResumen] = []


# ---------- Movimiento ----------
class MovimientoCrear(BaseModel):
    producto_id: uuid.UUID
    usuario_id: uuid.UUID
    tipo: TipoMovimiento
    cantidad: int = Field(gt=0)


class MovimientoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    producto_id: uuid.UUID
    usuario_id: uuid.UUID
    tipo: TipoMovimiento
    cantidad: int
    fecha: datetime


class MovimientoCreadoOut(BaseModel):
    movimiento: MovimientoOut
    stock_resultante: int
    alerta_generada: bool
