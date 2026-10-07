from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from app.models.order import Order, OrderItem
from app.core.shipping import get_shipping_option
from app.models.affiliate import Affiliate
from app.models.affiliate_commission import AffiliateCommission
from app.models.coffee import Coffee
from app.models.marketplace_product import MarketplaceProduct
from app.repositories.checkout import prepare_checkout_lines
from app.schemas.order import OrderCreate, ShippingAddressUpdate


def create_order_draft(session: Session, user_id: str, payload: OrderCreate) -> Order:
    lines = prepare_checkout_lines(session, payload.items)
    subtotal_cents = sum(line.line_total_cents for line in lines)
    affiliate_id = None
    if payload.referral_code:
        affiliate = session.scalar(
            select(Affiliate).where(
                Affiliate.referral_code == payload.referral_code.strip().lower(),
                Affiliate.status == "active",
            )
        )
        if affiliate is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Referral code is invalid or inactive")
        affiliate_id = affiliate.id
    order = Order(
        user_id=user_id,
        affiliate_id=affiliate_id,
        status="draft",
        currency_code="USD",
        subtotal_cents=subtotal_cents,
        shipping_cents=0,
        tax_cents=0,
        total_cents=subtotal_cents,
        items=[
            OrderItem(
                coffee_id=line.coffee_id,
                marketplace_product_id=line.marketplace_product_id,
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


def get_order(session: Session, order_id: int, user_id: str) -> Order:
    order = session.scalar(
        select(Order).where(Order.id == order_id, Order.user_id == user_id).options(selectinload(Order.items))
    )
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


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
    shipping_option = get_shipping_option(address.country_code)
    if shipping_option is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Shipping is not available for this country yet")

    for field, value in address.model_dump().items():
        setattr(order, field, value.strip() if isinstance(value, str) else value)
    order.country_code = order.country_code.upper()
    order.shipping_cents = shipping_option.shipping_cents
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
            if item.coffee_id is not None:
                inventory_model = Coffee
                inventory_id = item.coffee_id
            else:
                inventory_model = MarketplaceProduct
                inventory_id = item.marketplace_product_id
            result = session.execute(update(inventory_model).where(inventory_model.id == inventory_id, inventory_model.inventory_units >= item.quantity).values(inventory_units=inventory_model.inventory_units - item.quantity))
            inventory_ok = inventory_ok and result.rowcount == 1
        order.status = "paid" if inventory_ok else "inventory_issue"
        if order.status == "paid" and order.affiliate_id is not None:
            commission_exists = session.scalar(
                select(AffiliateCommission).where(AffiliateCommission.order_id == order.id)
            )
            if commission_exists is None:
                affiliate = session.get(Affiliate, order.affiliate_id)
                if affiliate is not None:
                    commission_cents = (order.subtotal_cents * affiliate.commission_rate_bps) // 10000
                    session.add(
                        AffiliateCommission(
                            affiliate_id=affiliate.id,
                            order_id=order.id,
                            amount_cents=commission_cents,
                            status="pending",
                        )
                    )
    else:
        order.status = "cancelled"
    session.commit()
    session.refresh(order)
    return order
