from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification import Notification


def list_notifications(session: Session, user_id: str) -> list[Notification]:
    statement = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc(), Notification.id.desc())
    return list(session.scalars(statement).all())


def create_order_notification(session: Session, user_id: str, order_id: int, paid: bool) -> Notification:
    kind = "order_paid" if paid else "order_cancelled"
    existing = session.scalar(
        select(Notification).where(Notification.user_id == user_id, Notification.order_id == order_id, Notification.kind == kind)
    )
    if existing is not None:
        return existing

    notification = Notification(
        user_id=user_id,
        order_id=order_id,
        kind=kind,
        title="Payment received" if paid else "Checkout expired",
        body=(
            f"Order #{order_id} is paid and inventory has been reserved."
            if paid
            else f"Order #{order_id} expired before payment was completed."
        ),
    )
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification


def create_return_notification(session: Session, user_id: str, order_id: int, approved: bool) -> Notification:
    kind = "return_approved" if approved else "return_rejected"
    existing = session.scalar(
        select(Notification).where(Notification.user_id == user_id, Notification.order_id == order_id, Notification.kind == kind)
    )
    if existing is not None:
        return existing

    notification = Notification(
        user_id=user_id,
        order_id=order_id,
        kind=kind,
        title="Return approved" if approved else "Return request declined",
        body=(
            f"Your return request for order #{order_id} was approved. Our team will follow up with next steps."
            if approved
            else f"Your return request for order #{order_id} was declined. Contact support if you need help."
        ),
    )
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification


def mark_notification_read(session: Session, notification_id: int, user_id: str) -> Notification | None:
    notification = session.scalar(select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id))
    if notification is None:
        return None
    notification.read_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(notification)
    return notification
