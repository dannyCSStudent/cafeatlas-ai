from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.settings import Settings, get_settings
from app.db.session import get_db_session
from app.repositories.coffees import create_coffee, get_coffee_by_slug, list_coffees
from app.schemas.coffee import CoffeeCreate, CoffeeRead

router = APIRouter(tags=["coffees"])


@router.get("/coffees", response_model=list[CoffeeRead])
def coffees(
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> list[CoffeeRead]:
    _ = settings
    return [CoffeeRead.model_validate(coffee) for coffee in list_coffees(session)]


@router.get("/coffees/{slug}", response_model=CoffeeRead)
def coffee_detail(
    slug: str,
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> CoffeeRead:
    _ = settings
    coffee = get_coffee_by_slug(session, slug)
    if coffee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coffee not found")
    return CoffeeRead.model_validate(coffee)


@router.post("/coffees", response_model=CoffeeRead, status_code=status.HTTP_201_CREATED)
def create_coffee_route(
    payload: CoffeeCreate,
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> CoffeeRead:
    _ = settings

    if get_coffee_by_slug(session, payload.slug) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Coffee slug already exists")

    coffee = create_coffee(session, payload)
    return CoffeeRead.model_validate(coffee)
