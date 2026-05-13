import json

from redis.asyncio import Redis, from_url
from loguru import logger

from app.core.config import settings

_redis: Redis | None = None

LOCATIONS_KEY = "locations:all"
CACHE_TTL = 300  # 5 minutes


async def init_redis() -> None:
    global _redis
    _redis = await from_url(settings.REDIS_URL, decode_responses=True)
    logger.info("Redis connected")


async def close_redis() -> None:
    global _redis
    if _redis:
        await _redis.close()
        _redis = None


def _get() -> Redis:
    if _redis is None:
        raise RuntimeError("Redis not initialised")
    return _redis


async def cache_get(key: str) -> list | dict | None:
    try:
        val = await _get().get(key)
        return json.loads(val) if val else None
    except Exception as e:
        logger.warning(f"Redis GET error ({key}): {e}")
        return None


async def cache_set(key: str, value: list | dict, ttl: int = CACHE_TTL) -> None:
    try:
        await _get().setex(key, ttl, json.dumps(value, default=str))
    except Exception as e:
        logger.warning(f"Redis SET error ({key}): {e}")


async def cache_delete(*keys: str) -> None:
    try:
        await _get().delete(*keys)
    except Exception as e:
        logger.warning(f"Redis DEL error {keys}: {e}")


# Refresh token helpers
async def store_refresh_token(jti: str, user_id: int, ttl_days: int) -> None:
    await _get().setex(f"refresh:{jti}", ttl_days * 86400, str(user_id))


async def get_refresh_user_id(jti: str) -> int | None:
    val = await _get().get(f"refresh:{jti}")
    return int(val) if val else None


async def revoke_refresh_token(jti: str) -> None:
    await _get().delete(f"refresh:{jti}")
