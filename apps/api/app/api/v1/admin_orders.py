from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin_user_id
from app.db.session import get_db_session
from app.repositories.notifications import create_return_notification
from app.repositories.orders import list_all_orders, update_fulfillment
from app.repositories.return_requests import list_return_requests, update_return_request
from app.schemas.order import FulfillmentUpdate, OrderRead
from app.schemas.return_request import ReturnRequestRead, ReturnRequestUpdate

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


@router.get("/returns", response_model=list[ReturnRequestRead])
def admin_returns(
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> list[ReturnRequestRead]:
    return [ReturnRequestRead.model_validate(item) for item in list_return_requests(session)]


@router.patch("/returns/{request_id}", response_model=ReturnRequestRead)
def admin_return_update(
    request_id: int,
    payload: ReturnRequestUpdate,
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> ReturnRequestRead:
    request = update_return_request(session, request_id, payload)
    create_return_notification(session, request.user_id, request.order_id, payload.status == "approved")
    return ReturnRequestRead.model_validate(request)
