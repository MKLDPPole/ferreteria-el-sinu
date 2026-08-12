from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.database import Base, engine
from app.routers import auth, productos, movimientos, usuarios, categorias

# Crea las tablas si no existen (para un proyecto en producción real se usaría Alembic;
# aquí se deja create_all para simplificar el arranque del MVP).
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Ferretería El Sinú — Sistema de Inventarios",
    description="Backend REST (FastAPI + PostgreSQL + Redis) del proyecto integrador "
                "Web y Sistemas Móviles — Momento 3.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def manejador_validacion(request: Request, exc: RequestValidationError):
    """Mensajes de error consistentes y legibles para el frontend (punto 3 del Momento 3)."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Datos inválidos", "errores": exc.errors()},
    )


@app.get("/", tags=["Salud"])
def raiz():
    return {"servicio": "Ferretería El Sinú API", "estado": "operativo"}


@app.get("/api/health", tags=["Salud"])
def health_check():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(categorias.router)
app.include_router(productos.router)
app.include_router(movimientos.router)
app.include_router(usuarios.router)
