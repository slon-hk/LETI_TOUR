from sqlalchemy import Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    corpus: Mapped[str] = mapped_column(String(20), index=True)
    floor: Mapped[int] = mapped_column(Integer, index=True)
    coordinates: Mapped[list] = mapped_column(JSON)
    indoor_position: Mapped[dict] = mapped_column(JSON)
    overview_position: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    panorama: Mapped[str] = mapped_column(String(500))
    description: Mapped[str] = mapped_column(Text, default="")
    markers: Mapped[list] = mapped_column(JSON, default=list)
