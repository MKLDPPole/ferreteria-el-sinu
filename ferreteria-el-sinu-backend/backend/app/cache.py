"""
Capa de caché con Redis resiliente:
Intenta conectar a Redis. Si el servidor de Redis no está activo,
captura la excepción y desactiva el caché de forma silenciosa para
que el sistema siga operando directamente con PostgreSQL sin caerse.
"""
import json
import redis
import logging

from app.config import settings

logger = logging.getLogger("uvicorn")

PREFIJO_STOCK = "stock:"
redis_client = None
redis_disponible = False

try:
    # Intentar conexión con un timeout de 2 segundos para no bloquear el inicio
    redis_client = redis.from_url(
        settings.redis_url, 
        decode_responses=True, 
        socket_connect_timeout=2
    )
    redis_client.ping()
    redis_disponible = True
    logger.info("✔ Conexión con Redis establecida exitosamente.")
except Exception as e:
    redis_client = None
    redis_disponible = False
    logger.warning(f"⚠ Redis no disponible localmente. Se omitirá el caché y se consultará PostgreSQL directamente: {e}")


def obtener_stock_cache(sku: str):
    if not redis_disponible or not redis_client:
        return None
    try:
        valor = redis_client.get(f"{PREFIJO_STOCK}{sku}")
        return json.loads(valor) if valor else None
    except Exception as e:
        logger.error(f"Error al leer caché Redis: {e}")
        return None


def guardar_stock_cache(sku: str, data: dict):
    if not redis_disponible or not redis_client:
        return
    try:
        redis_client.setex(
            f"{PREFIJO_STOCK}{sku}",
            settings.redis_ttl_segundos,
            json.dumps(data),
        )
    except Exception as e:
        logger.error(f"Error al escribir en caché Redis: {e}")


def invalidar_stock_cache(sku: str):
    if not redis_disponible or not redis_client:
        return
    try:
        redis_client.delete(f"{PREFIJO_STOCK}{sku}")
    except Exception as e:
        logger.error(f"Error al invalidar caché Redis: {e}")