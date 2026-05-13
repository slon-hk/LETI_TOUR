from sqlalchemy import Column, String, Integer, JSON
from database import Base

class DBLocation(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    corpus = Column(String)
    floor = Column(Integer)
    coordinates = Column(JSON)        # Храним список [широта, долгота]
    indoorPosition = Column(JSON)     # Храним словарь {"x": 10, "y": 20}
    overviewPosition = Column(JSON, nullable=True) 
    panorama = Column(String)
    description = Column(String)
    markers = Column(JSON)            # Храним список всех маркеров в формате JSON