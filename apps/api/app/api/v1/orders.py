from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session, selectinload

from app.core.auth import get_current_user_id
from app.db.session import get_db_session
from app.models.order import Order
from app.repositories.orders import create_order_draft
from app.schemas.order import OrderCreate, OrderRead

router = APIRouter(tags=["orders"])


@router.post("/orders", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> OrderRead:
    order = create_order_draft(session, user_id, payload)
    session.refresh(order, attribute_names=["items"])
    return OrderRead.model_validate(order)
