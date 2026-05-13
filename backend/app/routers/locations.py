from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import LETI_STRUCTURE
from app.core.dependencies import get_current_user, require_role
from app.db.session import get_db
from app.models.location import Location
from app.models.user import RoleEnum, User
from app.schemas.location import LocationCreate, LocationRead, LocationUpdate
from app.services.cache import LOCATIONS_KEY, cache_delete, cache_get, cache_set

router = APIRouter(tags=["locations"])


def _validate_location(corpus: str, floor: int) -> None:
    if corpus not in LETI_STRUCTURE:
        raise HTTPException(400, f"Корпус '{corpus}' не существует")
    if floor not in LETI_STRUCTURE[corpus]:
        raise HTTPException(400, f"В корпусе '{corpus}' нет этажа {floor}")


def _to_read(loc: Location) -> dict:
    return LocationRead(
        id=loc.id,
        name=loc.name,
        corpus=loc.corpus,
        floor=loc.floor,
        coordinates=loc.coordinates,
        panorama=loc.panorama,
        description=loc.description,
        markers=loc.markers,
        indoorPosition=loc.indoor_position,
        overviewPosition=loc.overview_position,
    ).model_dump(by_alias=True)


@router.get("/locations", response_model=list[LocationRead])
async def get_locations(db: AsyncSession = Depends(get_db)):
    cached = await cache_get(LOCATIONS_KEY)
    if cached is not None:
        return cached

    result = await db.execute(select(Location).order_by(Location.name))
    locs = result.scalars().all()
    data = [_to_read(l) for l in locs]
    await cache_set(LOCATIONS_KEY, data)
    return data


@router.get("/locations/{location_id}", response_model=LocationRead)
async def get_location(location_id: str, db: AsyncSession = Depends(get_db)):
    cached = await cache_get(f"location:{location_id}")
    if cached is not None:
        return cached

    loc = await db.get(Location, location_id)
    if not loc:
        raise HTTPException(404, "Локация не найдена")
    data = _to_read(loc)
    await cache_set(f"location:{location_id}", data)
    return data


@router.post("/locations", response_model=LocationRead, status_code=status.HTTP_201_CREATED)
async def create_location(
    payload: LocationCreate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(RoleEnum.superadmin, RoleEnum.editor)),
):
    _validate_location(payload.corpus, payload.floor)
    if await db.get(Location, payload.id):
        raise HTTPException(400, "ID уже занят")

    loc = Location(
        id=payload.id,
        name=payload.name,
        corpus=payload.corpus,
        floor=payload.floor,
        coordinates=payload.coordinates,
        indoor_position=payload.indoor_position.model_dump(),
        overview_position=payload.overview_position.model_dump() if payload.overview_position else None,
        panorama=payload.panorama,
        description=payload.description,
        markers=[m.model_dump() for m in payload.markers],
    )
    db.add(loc)
    await db.commit()
    await db.refresh(loc)
    await cache_delete(LOCATIONS_KEY)
    return _to_read(loc)


@router.put("/locations/{location_id}", response_model=LocationRead)
async def update_location(
    location_id: str,
    payload: LocationUpdate,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(RoleEnum.superadmin, RoleEnum.editor)),
):
    _validate_location(payload.corpus, payload.floor)
    loc = await db.get(Location, location_id)
    if not loc:
        raise HTTPException(404, "Локация не найдена")

    loc.name = payload.name
    loc.corpus = payload.corpus
    loc.floor = payload.floor
    loc.coordinates = payload.coordinates
    loc.indoor_position = payload.indoor_position.model_dump()
    loc.overview_position = payload.overview_position.model_dump() if payload.overview_position else None
    loc.panorama = payload.panorama
    loc.description = payload.description
    loc.markers = [m.model_dump() for m in payload.markers]

    await db.commit()
    await db.refresh(loc)
    await cache_delete(LOCATIONS_KEY, f"location:{location_id}")
    return _to_read(loc)


@router.delete("/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(
    location_id: str,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_role(RoleEnum.superadmin, RoleEnum.editor)),
):
    loc = await db.get(Location, location_id)
    if not loc:
        raise HTTPException(404, "Локация не найдена")
    await db.delete(loc)
    await db.commit()
    await cache_delete(LOCATIONS_KEY, f"location:{location_id}")
