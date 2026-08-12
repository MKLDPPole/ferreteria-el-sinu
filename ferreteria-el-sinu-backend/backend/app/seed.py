"""
Script de datos semilla. Ejecutar con: python -m app.seed
Crea usuarios de los 3 roles, categorías y productos de ejemplo,
tal como aparecen en los mockups del Momento 2 (Tornillo 5mm, Broca 8mm, etc).
"""
from app.database import SessionLocal, Base, engine
from app import models, security

Base.metadata.create_all(bind=engine)
db = SessionLocal()

try:
    if db.query(models.Usuario).count() == 0:
        usuarios = [
            models.Usuario(nombre="Ana Administradora", username="admin", rol=models.RolUsuario.ADMIN,
                            password_hash=security.hash_password("admin123")),
            models.Usuario(nombre="María Vendedora", username="vendedor", rol=models.RolUsuario.VENDEDOR,
                            password_hash=security.hash_password("vendedor123")),
            models.Usuario(nombre="Juan Bodega", username="bodeguero", rol=models.RolUsuario.BODEGUERO,
                            password_hash=security.hash_password("bodega123")),
        ]
        db.add_all(usuarios)
        db.commit()
        print("✔ Usuarios creados: admin/admin123, vendedor/vendedor123, bodeguero/bodega123")

    if db.query(models.Categoria).count() == 0:
        categorias = [
            models.Categoria(nombre="Tornillería"),
            models.Categoria(nombre="Cemento y agregados"),
            models.Categoria(nombre="Tuberías"),
            models.Categoria(nombre="Herramientas eléctricas"),
        ]
        db.add_all(categorias)
        db.commit()
        print("✔ Categorías creadas")

    if db.query(models.Producto).count() == 0:
        cat_tornilleria = db.query(models.Categoria).filter_by(nombre="Tornillería").first()
        cat_cemento = db.query(models.Categoria).filter_by(nombre="Cemento y agregados").first()
        cat_tuberias = db.query(models.Categoria).filter_by(nombre="Tuberías").first()
        cat_herramientas = db.query(models.Categoria).filter_by(nombre="Herramientas eléctricas").first()

        productos = [
            models.Producto(sku="SKU-042", nombre="Tornillo 5mm c/100", categoria_id=cat_tornilleria.id,
                             unidad_medida="Caja", stock_actual=8, stock_minimo=10),
            models.Producto(sku="SKU-117", nombre="Broca 8mm HSS", categoria_id=cat_herramientas.id,
                             unidad_medida="Unidad", stock_actual=3, stock_minimo=10),
            models.Producto(sku="SKU-078", nombre="Tubo PVC 1/2 x 6m", categoria_id=cat_tuberias.id,
                             unidad_medida="Unidad", stock_actual=0, stock_minimo=5),
            models.Producto(sku="SKU-001", nombre="Cemento Gris 50kg", categoria_id=cat_cemento.id,
                             unidad_medida="Bulto", stock_actual=120, stock_minimo=20),
            models.Producto(sku="SKU-015", nombre="Varilla 3/8 x 6m", categoria_id=cat_cemento.id,
                             unidad_medida="Unidad", stock_actual=64, stock_minimo=15),
        ]
        db.add_all(productos)
        db.commit()
        print("✔ Productos creados")

    print("Datos semilla listos.")
finally:
    db.close()
