from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AffiliateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    referral_code: str
    status: str
    commission_rate_bps: int
    created_at: datetime


class AffiliateAdminRead(AffiliateRead):
    user_id: str
    pending_commission_cents: int
    approved_commission_cents: int
    paid_commission_cents: int
    attributed_order_count: int


class AffiliateUpdate(BaseModel):
    status: str = Field(pattern="^(requested|active|paused)$")
    commission_rate_bps: int = Field(ge=0, le=10000)


class AffiliateApplyRead(BaseModel):
    affiliate: AffiliateRead
    referral_url: str


class AffiliateDashboardRead(AffiliateApplyRead):
    pending_commission_cents: int
    approved_commission_cents: int
    paid_commission_cents: int
    attributed_order_count: int
