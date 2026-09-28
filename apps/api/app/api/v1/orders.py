from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.settings import Settings, get_settings
from app.core import stripe as stripe_client
from app.db.session import get_db_session
from app.repositories.orders import create_order_draft, get_draft_order, list_orders, mark_checkout_pending, update_order_shipping
from app.schemas.order import CheckoutSessionCreate, CheckoutSessionRead, OrderCreate, OrderRead, ShippingAddressUpdate

router = APIRouter(tags=["orders"])


@router.get("/orders", response_model=list[OrderRead])
def orders(
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> list[OrderRead]:
    return [OrderRead.model_validate(order) for order in list_orders(session, user_id)]


@router.patch("/orders/{order_id}/shipping", response_model=OrderRead)
def update_shipping(
    order_id: int,
    payload: ShippingAddressUpdate,
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> OrderRead:
    return OrderRead.model_validate(update_order_shipping(session, order_id, user_id, payload))


@router.post("/orders/{order_id}/checkout", response_model=CheckoutSessionRead)
def create_checkout_session(
    order_id: int,
    payload: CheckoutSessionCreate,
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
    settings: Settings = Depends(get_settings),
) -> CheckoutSessionRead:
    order = get_draft_order(session, order_id, user_id)
    session_id, checkout_url = stripe_client.create_checkout_session(settings, order, payload.success_url, payload.cancel_url)
    mark_checkout_pending(session, order, session_id)
    return CheckoutSessionRead(order_id=order.id, session_id=session_id, checkout_url=checkout_url)


@router.post("/orders", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> OrderRead:
    order = create_order_draft(session, user_id, payload)
    session.refresh(order, attribute_names=["items"])
    return OrderRead.model_validate(order)
