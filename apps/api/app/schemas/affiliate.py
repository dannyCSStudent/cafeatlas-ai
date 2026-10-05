from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AffiliateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    referral_code: str
    status: str
    commission_rate_bps: int
    created_at: datetime


class AffiliateApplyRead(BaseModel):
    affiliate: AffiliateRead
    referral_url: str
