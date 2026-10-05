from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WholesalePricingTierPayload(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    min_boxes: int = Field(ge=1, le=100000)
    max_boxes: int | None = Field(default=None, ge=1, le=100000)
    price_per_box_cents: int = Field(ge=1, le=10000000)
    currency_code: str = Field(default="USD", min_length=3, max_length=3)
    active: bool = True


class WholesalePricingTierRead(WholesalePricingTierPayload):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
