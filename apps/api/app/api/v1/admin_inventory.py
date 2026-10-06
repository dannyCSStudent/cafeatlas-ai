from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin_user_id
from app.db.session import get_db_session
from app.repositories.coffees import list_coffees
from app.repositories.inventory import update_inventory
from app.schemas.coffee import CoffeeRead
from app.schemas.inventory import InventoryUpdate

router = APIRouter(prefix="/admin/inventory", tags=["admin-inventory"])


@router.get("", response_model=list[CoffeeRead])
def inventory(
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> list[CoffeeRead]:
    return [CoffeeRead.model_validate(coffee) for coffee in list_coffees(session, page=1, page_size=100, sort="newest")]


@router.patch("/{coffee_id}", response_model=CoffeeRead)
def inventory_update(
    coffee_id: int,
    payload: InventoryUpdate,
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> CoffeeRead:
    return CoffeeRead.model_validate(update_inventory(session, coffee_id, payload))
