from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SubscriptionCheckoutCreate(BaseModel):
    plan: str
    success_url: str
    cancel_url: str


class SubscriptionCheckoutRead(BaseModel):
    checkout_url: str
    session_id: str


class SubscriptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    plan: str
    status: str
    price_id: str
    current_period_end: datetime | None
    cancel_at_period_end: bool
