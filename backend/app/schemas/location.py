from pydantic import BaseModel, ConfigDict, Field


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
    type: str = "nav"
    image: str | None = None
    size: MarkerSize | None = None
    anchor: str = "bottom center"
    tooltip: str | None = None
    target: str | None = None
    title: str | None = None
    text: str | None = None
    audio: str | None = None
    video: str | None = None
    model_3d: str | None = None


class LocationBase(BaseModel):
    id: str
    name: str
    corpus: str
    floor: int
    coordinates: list[float]
    panorama: str
    description: str = ""
    markers: list[Marker] = []


class LocationRead(LocationBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    # Expose snake_case DB fields as camelCase for frontend compatibility
    indoor_position: Position2D = Field(alias="indoorPosition")
    overview_position: Position2D | None = Field(None, alias="overviewPosition")

    def model_post_init(self, __context) -> None:
        # Populate from ORM snake_case attributes if aliases not set
        if not self.__pydantic_fields_set__.intersection({"indoorPosition", "indoor_position"}):
            pass  # handled by from_attributes


class LocationCreate(LocationBase):
    indoor_position: Position2D = Field(alias="indoorPosition")
    overview_position: Position2D | None = Field(None, alias="overviewPosition")

    model_config = ConfigDict(populate_by_name=True)


class LocationUpdate(LocationBase):
    indoor_position: Position2D = Field(alias="indoorPosition")
    overview_position: Position2D | None = Field(None, alias="overviewPosition")

    model_config = ConfigDict(populate_by_name=True)
