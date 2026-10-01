from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core import stripe as stripe_client
from app.core.auth import get_current_user_id
from app.core.settings import Settings, get_settings
from app.db.session import get_db_session
from app.repositories.subscriptions import get_subscription
from app.schemas.subscription import SubscriptionCheckoutCreate, SubscriptionCheckoutRead, SubscriptionRead

router = APIRouter(tags=["subscriptions"])


@router.get("/subscriptions", response_model=SubscriptionRead | None)
def subscription(session: Session = Depends(get_db_session), user_id: str = Depends(get_current_user_id)) -> SubscriptionRead | None:
    current = get_subscription(session, user_id)
    return SubscriptionRead.model_validate(current) if current else None


@router.post("/subscriptions/checkout", response_model=SubscriptionCheckoutRead)
def subscription_checkout(
    payload: SubscriptionCheckoutCreate,
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
    settings: Settings = Depends(get_settings),
) -> SubscriptionCheckoutRead:
    if get_subscription(session, user_id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An active Club subscription already exists")
    session_id, checkout_url = stripe_client.create_subscription_checkout_session(settings, user_id, payload.plan, payload.success_url, payload.cancel_url)
    return SubscriptionCheckoutRead(checkout_url=checkout_url, session_id=session_id)
