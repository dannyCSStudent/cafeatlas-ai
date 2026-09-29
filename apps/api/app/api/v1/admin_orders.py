from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin_user_id
from app.db.session import get_db_session
from app.repositories.orders import list_all_orders, update_fulfillment
from app.schemas.order import FulfillmentUpdate, OrderRead

router = APIRouter(prefix="/admin", tags=["admin-orders"])


@router.get("/orders", response_model=list[OrderRead])
def admin_orders(
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> list[OrderRead]:
    return [OrderRead.model_validate(order) for order in list_all_orders(session)]


@router.patch("/orders/{order_id}/fulfillment", response_model=OrderRead)
def admin_fulfillment(
    order_id: int,
    payload: FulfillmentUpdate,
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> OrderRead:
    return OrderRead.model_validate(update_fulfillment(session, order_id, payload))
