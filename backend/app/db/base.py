from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import all models here so Alembic can discover them
from app.models.user import User  # noqa: F401, E402
from app.models.location import Location  # noqa: F401, E402
