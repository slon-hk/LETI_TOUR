from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.user import RoleEnum


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    role: RoleEnum
    is_active: bool
    created_at: datetime


class UserCreate(BaseModel):
    username: str
    password: str
    role: RoleEnum = RoleEnum.editor


class UserUpdate(BaseModel):
    username: str | None = None
    password: str | None = None
    role: RoleEnum | None = None
    is_active: bool | None = None
