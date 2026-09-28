from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.coffee import Coffee
from app.schemas.checkout import CheckoutLineCreate, CheckoutLineRead


def prepare_checkout_lines(session: Session, requested_items: list[CheckoutLineCreate]) -> list[CheckoutLineRead]:
    requested_by_id = {item.coffee_id: item.quantity for item in requested_items}
    coffees = session.scalars(select(Coffee).where(Coffee.id.in_(requested_by_id))).all()
    coffees_by_id = {coffee.id: coffee for coffee in coffees}

    missing_ids = sorted(set(requested_by_id) - set(coffees_by_id))
    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coffee not found: {', '.join(str(coffee_id) for coffee_id in missing_ids)}",
        )

    lines: list[CheckoutLineRead] = []
    for coffee_id, quantity in requested_by_id.items():
        coffee = coffees_by_id[coffee_id]
        if coffee.inventory_units < quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"{coffee.name} has only {coffee.inventory_units} units available.",
            )
        lines.append(
            CheckoutLineRead(
                coffee_id=coffee.id,
                slug=coffee.slug,
                name=coffee.name,
                quantity=quantity,
                unit_price_cents=coffee.price_cents,
                line_total_cents=coffee.price_cents * quantity,
                available_inventory_units=coffee.inventory_units,
            )
        )
    return lines
