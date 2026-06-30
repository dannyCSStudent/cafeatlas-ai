from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.settings import Settings, get_settings
from app.db.session import get_db_session
from app.repositories.coffees import list_coffees
from app.schemas.coffee import CoffeeRead

router = APIRouter(tags=["coffees"])


@router.get("/coffees", response_model=list[CoffeeRead])
def coffees(
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> list[CoffeeRead]:
    _ = settings
    return [CoffeeRead.model_validate(coffee) for coffee in list_coffees(session)]
