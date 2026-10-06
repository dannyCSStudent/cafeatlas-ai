from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.coffee import Coffee
from app.schemas.inventory import InventoryUpdate


def update_inventory(session: Session, coffee_id: int, payload: InventoryUpdate) -> Coffee:
    coffee = session.scalar(select(Coffee).where(Coffee.id == coffee_id))
    if coffee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coffee not found")
    coffee.inventory_units = payload.inventory_units
    session.commit()
    session.refresh(coffee)
    return coffee
