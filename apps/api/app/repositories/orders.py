from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from app.models.order import Order, OrderItem
from app.models.coffee import Coffee
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


def list_all_orders(session: Session) -> list[Order]:
    statement = select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc(), Order.id.desc())
    return list(session.scalars(statement).all())


def update_fulfillment(session: Session, order_id: int, payload) -> Order:
    order = session.scalar(select(Order).where(Order.id == order_id).options(selectinload(Order.items)))
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    allowed_transitions = {
        "paid": "processing",
        "processing": "shipped",
        "shipped": "delivered",
    }
    if allowed_transitions.get(order.status) != payload.status:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Cannot move order from {order.status} to {payload.status}")
    order.status = payload.status
    if payload.tracking_number is not None:
        order.tracking_number = payload.tracking_number.strip()
    if payload.tracking_url is not None:
        order.tracking_url = payload.tracking_url.strip()
    session.commit()
    session.refresh(order)
    return order


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


def get_draft_order(session: Session, order_id: int, user_id: str) -> Order:
    order = session.scalar(
        select(Order).where(Order.id == order_id, Order.user_id == user_id).options(selectinload(Order.items))
    )
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.status != "draft":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Order is not ready for checkout")
    if not order.country_code or not order.recipient_name or not order.address_line1:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Shipping details are required before checkout")
    return order


def mark_checkout_pending(session: Session, order: Order, session_id: str) -> Order:
    order.status = "checkout_pending"
    order.stripe_session_id = session_id
    session.commit()
    session.refresh(order)
    return order


def complete_order_from_stripe(session: Session, session_id: str, paid: bool) -> Order | None:
    order = session.scalar(select(Order).where(Order.stripe_session_id == session_id))
    if order is None:
        return None
    if order.status == "paid":
        return order
    if paid:
        inventory_ok = True
        for item in order.items:
            result = session.execute(
                update(Coffee)
                .where(Coffee.id == item.coffee_id, Coffee.inventory_units >= item.quantity)
                .values(inventory_units=Coffee.inventory_units - item.quantity)
            )
            inventory_ok = inventory_ok and result.rowcount == 1
        order.status = "paid" if inventory_ok else "inventory_issue"
    else:
        order.status = "cancelled"
    session.commit()
    session.refresh(order)
    return order
