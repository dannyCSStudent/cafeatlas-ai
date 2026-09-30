from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.return_request import ReturnRequest
from app.schemas.return_request import ReturnRequestCreate, ReturnRequestUpdate


def list_return_requests(session: Session, user_id: str | None = None) -> list[ReturnRequest]:
    statement = select(ReturnRequest).order_by(ReturnRequest.created_at.desc(), ReturnRequest.id.desc())
    if user_id is not None:
        statement = statement.where(ReturnRequest.user_id == user_id)
    return list(session.scalars(statement).all())


def create_return_request(session: Session, order_id: int, user_id: str, payload: ReturnRequestCreate) -> ReturnRequest:
    order = session.scalar(select(Order).where(Order.id == order_id, Order.user_id == user_id))
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.status != "delivered":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Returns can only be requested for delivered orders")
    existing = session.scalar(select(ReturnRequest).where(ReturnRequest.order_id == order_id))
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A return request already exists for this order")

    request = ReturnRequest(order_id=order_id, user_id=user_id, reason=payload.reason.strip())
    session.add(request)
    session.commit()
    session.refresh(request)
    return request


def update_return_request(session: Session, request_id: int, payload: ReturnRequestUpdate) -> ReturnRequest:
    request = session.get(ReturnRequest, request_id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Return request not found")
    if request.status != "pending":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Return request has already been resolved")
    request.status = payload.status
    request.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(request)
    return request
