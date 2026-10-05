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
    click_count: int


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
    click_count: int


class AffiliateClickCreate(BaseModel):
    referral_code: str = Field(min_length=1, max_length=40)
    landing_path: str | None = Field(default=None, max_length=500)


class AffiliateCommissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    affiliate_id: int
    order_id: int
    amount_cents: int
    status: str
    created_at: datetime


class AffiliateCommissionUpdate(BaseModel):
    status: str = Field(pattern="^(approved|paid)$")
