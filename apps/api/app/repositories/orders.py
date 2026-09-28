from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem
from app.repositories.checkout import prepare_checkout_lines
from app.schemas.order import OrderCreate


def create_order_draft(session: Session, user_id: str, payload: OrderCreate) -> Order:
    lines = prepare_checkout_lines(session, payload.items)
    subtotal_cents = sum(line.line_total_cents for line in lines)
    order = Order(
        user_id=user_id,
        status="draft",
        currency_code="USD",
        subtotal_cents=subtotal_cents,
        shipping_cents=0,
        tax_cents=0,
        total_cents=subtotal_cents,
        items=[
            OrderItem(
                coffee_id=line.coffee_id,
                coffee_name=line.name,
                coffee_slug=line.slug,
                quantity=line.quantity,
                unit_price_cents=line.unit_price_cents,
                line_total_cents=line.line_total_cents,
            )
            for line in lines
        ],
    )
    session.add(order)
    session.commit()
    session.refresh(order)
    return order
