from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.subscription import Subscription


def get_subscription(session: Session, user_id: str) -> Subscription | None:
    return session.scalar(select(Subscription).where(Subscription.user_id == user_id))


def upsert_subscription(
    session: Session,
    *,
    user_id: str,
    plan: str,
    status: str,
    stripe_subscription_id: str,
    price_id: str,
    stripe_customer_id: str | None = None,
    current_period_end: datetime | None = None,
    cancel_at_period_end: bool = False,
) -> Subscription:
    subscription = session.scalar(select(Subscription).where(Subscription.user_id == user_id))
    if subscription is None:
        subscription = Subscription(user_id=user_id, plan=plan, status=status, stripe_subscription_id=stripe_subscription_id, price_id=price_id)
        session.add(subscription)

    subscription.plan = plan
    subscription.status = status
    subscription.stripe_subscription_id = stripe_subscription_id
    subscription.price_id = price_id
    subscription.stripe_customer_id = stripe_customer_id
    subscription.current_period_end = current_period_end
    subscription.cancel_at_period_end = cancel_at_period_end
    subscription.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(subscription)
    return subscription


def update_subscription_from_stripe(
    session: Session,
    *,
    stripe_subscription_id: str,
    status: str,
    price_id: str,
    stripe_customer_id: str | None,
    current_period_end: datetime | None,
    cancel_at_period_end: bool,
) -> Subscription | None:
    subscription = session.scalar(select(Subscription).where(Subscription.stripe_subscription_id == stripe_subscription_id))
    if subscription is None:
        return None
    subscription.status = status
    subscription.price_id = price_id
    subscription.stripe_customer_id = stripe_customer_id
    subscription.current_period_end = current_period_end
    subscription.cancel_at_period_end = cancel_at_period_end
    subscription.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(subscription)
    return subscription
