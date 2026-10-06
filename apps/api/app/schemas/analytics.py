from pydantic import BaseModel
from datetime import datetime


class AdminAnalyticsRead(BaseModel):
    coffee_count: int
    paid_order_count: int
    gross_sales_cents: int
    low_stock_count: int
    active_subscription_count: int
    paid_wholesale_count: int


class CustomerAnalyticsRead(BaseModel):
    paid_order_count: int
    lifetime_spend_cents: int
    average_order_cents: int
    active_subscription: bool
    latest_purchase_at: datetime | None


class ProducerAnalyticsRead(BaseModel):
    producer_id: int
    producer_name: str
    coffee_count: int
    current_inventory_units: int
    paid_units_sold: int
    paid_sales_cents: int
    top_coffee_name: str | None
