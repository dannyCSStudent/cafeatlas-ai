from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.settings import Settings, get_settings
from app.db.session import get_db_session
from app.repositories.origins import get_farm_by_slug, get_producer_by_slug, list_farms, list_producers
from app.schemas.origin import FarmRead, ProducerRead

router = APIRouter(tags=["origins"])


@router.get("/producers", response_model=list[ProducerRead])
def producers(
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> list[ProducerRead]:
    _ = settings
    return [ProducerRead.model_validate(producer) for producer in list_producers(session)]


@router.get("/producers/{slug}", response_model=ProducerRead)
def producer_detail(
    slug: str,
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> ProducerRead:
    _ = settings
    producer = get_producer_by_slug(session, slug)
    if producer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producer not found")
    return ProducerRead.model_validate(producer)


@router.get("/farms", response_model=list[FarmRead])
def farms(
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> list[FarmRead]:
    _ = settings
    return [FarmRead.model_validate(farm) for farm in list_farms(session)]


@router.get("/farms/{slug}", response_model=FarmRead)
def farm_detail(
    slug: str,
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> FarmRead:
    _ = settings
    farm = get_farm_by_slug(session, slug)
    if farm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
    return FarmRead.model_validate(farm)
