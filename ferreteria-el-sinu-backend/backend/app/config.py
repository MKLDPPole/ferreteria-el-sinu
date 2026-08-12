"""
Configuración centralizada del backend.
Todas las variables sensibles se leen desde el entorno (.env en local,
variables de entorno del proveedor en producción). Nunca se hardcodean
credenciales en el código.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Base de datos principal (PostgreSQL)
    database_url: str = "postgresql://postgres:sinu2026@localhost:5432/ferreteria_sinu"

    # Caché (Redis)
    redis_url: str = "redis://localhost:6379/0"
    redis_ttl_segundos: int = 300  # 5 minutos de vigencia del caché de stock

    # Seguridad / JWT
    secret_key: str = "cambia-esta-clave-en-produccion-por-una-generada-con-openssl"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # CORS: orígenes permitidos para el frontend
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
