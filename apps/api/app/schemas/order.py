from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.checkout import CheckoutLineCreate


class OrderCreate(BaseModel):
    items: list[CheckoutLineCreate]


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
    created_at: datetime
    items: list[OrderItemRead]
