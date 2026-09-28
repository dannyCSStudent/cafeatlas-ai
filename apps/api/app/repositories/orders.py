from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.order import Order, OrderItem
from app.repositories.checkout import prepare_checkout_lines
from app.schemas.order import OrderCreate, ShippingAddressUpdate


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


def list_orders(session: Session, user_id: str) -> list[Order]:
    statement = (
        select(Order)
        .where(Order.user_id == user_id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc(), Order.id.desc())
    )
    return list(session.scalars(statement).all())


def update_order_shipping(session: Session, order_id: int, user_id: str, address: ShippingAddressUpdate) -> Order:
    order = session.scalar(
        select(Order).where(Order.id == order_id, Order.user_id == user_id).options(selectinload(Order.items))
    )
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.status != "draft":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only draft orders can be updated")
    if address.country_code.upper() != "US":
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Shipping is currently available in the US only")

    for field, value in address.model_dump().items():
        setattr(order, field, value.strip() if isinstance(value, str) else value)
    order.country_code = order.country_code.upper()
    order.shipping_cents = 699
    order.total_cents = order.subtotal_cents + order.shipping_cents + order.tax_cents
    session.commit()
    session.refresh(order)
    return order
