from pydantic import BaseModel
from typing import List, Optional

class Position2D(BaseModel):
    x: float
    y: float

class Position3D(BaseModel):
    yaw: str
    pitch: str

class MarkerSize(BaseModel):
    width: int
    height: int

class Marker(BaseModel):
    id: str
    position: Position3D
    image: Optional[str] = "https://photo-sphere-viewer-data.netlify.app/assets/pictos/pin-blue.png"
    size: Optional[MarkerSize] = MarkerSize(width=32, height=32)
    anchor: str = "bottom center"
    tooltip: Optional[str] = None
    type: str
    target: Optional[str] = None
    title: Optional[str] = None
    text: Optional[str] = None
    audio: Optional[str] = None
    video: Optional[str] = None
    model_3d: Optional[str] = None

class Location(BaseModel):
    id: str
    name: str
    corpus: str
    floor: int
    coordinates: List[float]
    indoorPosition: Position2D
    overviewPosition: Optional[Position2D] = None
    panorama: str
    description: str
    markers: List[Marker]
    
    class Config:
        orm_mode = True # Позволяет Pydantic читать данные из SQLAlchemy моделей