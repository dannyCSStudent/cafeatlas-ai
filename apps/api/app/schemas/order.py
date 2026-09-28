from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.checkout import CheckoutLineCreate


class OrderCreate(BaseModel):
    items: list[CheckoutLineCreate]


class ShippingAddressUpdate(BaseModel):
    recipient_name: str = Field(min_length=1, max_length=255)
    address_line1: str = Field(min_length=1, max_length=255)
    address_line2: str | None = Field(default=None, max_length=255)
    city: str = Field(min_length=1, max_length=120)
    region: str = Field(min_length=1, max_length=120)
    postal_code: str = Field(min_length=1, max_length=40)
    country_code: str = Field(min_length=2, max_length=2)


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    coffee_id: int
    coffee_name: str
    coffee_slug: str
    quantity: int
    unit_price_cents: int
    line_total_cents: int


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    currency_code: str
    subtotal_cents: int
    shipping_cents: int
    tax_cents: int
    total_cents: int
    recipient_name: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    region: str | None = None
    postal_code: str | None = None
    country_code: str | None = None
    created_at: datetime
    items: list[OrderItemRead]
