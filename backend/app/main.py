from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger
from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import AsyncSessionLocal, engine
from app.models.user import RoleEnum, User
from app.routers import auth, locations, uploads, users
from app.services.cache import close_redis, init_redis


async def _seed_superadmin() -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none() is None:
            admin = User(
                username=settings.INITIAL_ADMIN_USERNAME,
                hashed_password=hash_password(settings.INITIAL_ADMIN_PASSWORD),
                role=RoleEnum.superadmin,
            )
            db.add(admin)
            await db.commit()
            logger.info(f"Superadmin '{settings.INITIAL_ADMIN_USERNAME}' created")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await init_redis()
    await _seed_superadmin()
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    logger.info("Application started")
    yield
    # Shutdown
    await close_redis()
    await engine.dispose()
    logger.info("Application stopped")


app = FastAPI(title="LETI Tour API", version="7.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")

app.mount("/media", StaticFiles(directory=settings.UPLOAD_DIR), name="media")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
