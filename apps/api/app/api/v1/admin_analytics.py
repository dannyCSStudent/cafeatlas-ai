from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin_user_id, get_current_user_id
from app.db.session import get_db_session
from app.repositories.analytics import get_admin_analytics, get_customer_analytics
from app.schemas.analytics import AdminAnalyticsRead, CustomerAnalyticsRead

router = APIRouter(prefix="/admin/analytics", tags=["admin-analytics"])


@router.get("/overview", response_model=AdminAnalyticsRead)
def analytics_overview(
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> AdminAnalyticsRead:
    return AdminAnalyticsRead(**get_admin_analytics(session))


@router.get("/customer", response_model=CustomerAnalyticsRead)
def customer_analytics(
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> CustomerAnalyticsRead:
    return CustomerAnalyticsRead(**get_customer_analytics(session, user_id))
