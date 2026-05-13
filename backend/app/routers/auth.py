from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_user, oauth2_scheme
from app.core.security import (
    create_access_token,
    create_refresh_jti,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AccessToken, LoginRequest, RefreshRequest, TokenPair
from app.services.cache import (
    get_refresh_user_id,
    revoke_refresh_token,
    store_refresh_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenPair)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == body.username))
    user: User | None = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный логин или пароль")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Аккаунт отключён")

    access_token = create_access_token(user.id, user.role)
    jti = create_refresh_jti()
    await store_refresh_token(jti, user.id, settings.REFRESH_TOKEN_EXPIRE_DAYS)

    return TokenPair(access_token=access_token, refresh_token=jti)


@router.post("/refresh", response_model=AccessToken)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    user_id = await get_refresh_user_id(body.refresh_token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Токен обновления недействителен")

    user = await db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Пользователь не найден")

    access_token = create_access_token(user.id, user.role)
    return AccessToken(access_token=access_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(body: RefreshRequest, _user: User = Depends(get_current_user)):
    await revoke_refresh_token(body.refresh_token)
