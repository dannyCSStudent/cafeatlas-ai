from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WholesaleRequestItemCreate(BaseModel):
    coffee_id: int = Field(ge=1)
    quantity_boxes: int = Field(ge=1, le=10000)


class WholesaleRequestItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    coffee_id: int
    coffee_name: str
    coffee_slug: str
    quantity_boxes: int


class WholesaleRequestCreate(BaseModel):
    company_name: str = Field(min_length=1, max_length=180)
    contact_name: str = Field(min_length=1, max_length=180)
    estimated_boxes: int = Field(ge=5, le=10000)
    delivery_country: str = Field(default="US", min_length=2, max_length=2)
    note: str = Field(min_length=1, max_length=4000)
    coffee_preferences: str | None = Field(default=None, max_length=2000)
    items: list[WholesaleRequestItemCreate] = Field(default_factory=list, max_length=20)


class WholesaleRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    company_name: str
    contact_name: str
    estimated_boxes: int
    delivery_country: str
    note: str
    coffee_preferences: str | None
    items: list[WholesaleRequestItemRead]
    status: str
    quote_total_cents: int | None
    price_per_box_cents: int | None
    quote_note: str | None
    quoted_at: datetime | None
    stripe_session_id: str | None
    stripe_invoice_id: str | None
    invoice_url: str | None
    paid_at: datetime | None
    created_at: datetime


class WholesaleRequestAdminRead(WholesaleRequestRead):
    user_id: str


class WholesaleRequestAdminUpdate(BaseModel):
    status: str | None = Field(default=None, pattern="^(requested|contacted|quoted|approved|payment_pending|paid|fulfilled|cancelled)$")
    quote_total_cents: int | None = Field(default=None, ge=0, le=100_000_000)
    price_per_box_cents: int | None = Field(default=None, ge=0, le=10_000_000)
    quote_note: str | None = Field(default=None, max_length=4000)


class WholesaleCheckoutCreate(BaseModel):
    success_url: str = Field(min_length=1, max_length=1000)
    cancel_url: str = Field(min_length=1, max_length=1000)
