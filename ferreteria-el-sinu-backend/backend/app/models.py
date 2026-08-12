import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Integer, ForeignKey, Enum, TIMESTAMP, CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class RolUsuario(str, enum.Enum):
    ADMIN = "ADMIN"
    VENDEDOR = "VENDEDOR"
    BODEGUERO = "BODEGUERO"


class TipoMovimiento(str, enum.Enum):
    ENTRADA = "ENTRADA"
    SALIDA = "SALIDA"
    AJUSTE = "AJUSTE"


class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False, unique=True)

    productos = relationship("Producto", back_populates="categoria")


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False)
    username = Column(String(50), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(Enum(RolUsuario), nullable=False)

    movimientos = relationship("Movimiento", back_populates="usuario")


class Producto(Base):
    __tablename__ = "productos"
    __table_args__ = (
        CheckConstraint("stock_actual >= 0", name="ck_stock_actual_no_negativo"),
        CheckConstraint("stock_minimo >= 0", name="ck_stock_minimo_no_negativo"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku = Column(String(50), nullable=False, unique=True, index=True)
    nombre = Column(String(150), nullable=False)
    categoria_id = Column(UUID(as_uuid=True), ForeignKey("categorias.id", ondelete="RESTRICT"), nullable=False)
    unidad_medida = Column(String(20), nullable=False)
    stock_actual = Column(Integer, nullable=False, default=0)
    stock_minimo = Column(Integer, nullable=False, default=0)

    categoria = relationship("Categoria", back_populates="productos")
    movimientos = relationship("Movimiento", back_populates="producto")


class Movimiento(Base):
    __tablename__ = "movimientos"
    __table_args__ = (
        CheckConstraint("cantidad > 0", name="ck_cantidad_positiva"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    producto_id = Column(UUID(as_uuid=True), ForeignKey("productos.id", ondelete="RESTRICT"), nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False)
    tipo = Column(Enum(TipoMovimiento), nullable=False)
    cantidad = Column(Integer, nullable=False)
    fecha = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)

    producto = relationship("Producto", back_populates="movimientos")
    usuario = relationship("Usuario", back_populates="movimientos")
