from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.db.session import get_db_session
from app.repositories.notifications import list_notifications, mark_notification_read
from app.schemas.notification import NotificationRead

router = APIRouter(tags=["notifications"])


@router.get("/notifications", response_model=list[NotificationRead])
def notifications(
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> list[NotificationRead]:
    return [NotificationRead.model_validate(item) for item in list_notifications(session, user_id)]


@router.post("/notifications/{notification_id}/read", response_model=NotificationRead)
def read_notification(
    notification_id: int,
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> NotificationRead:
    notification = mark_notification_read(session, notification_id, user_id)
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return NotificationRead.model_validate(notification)
