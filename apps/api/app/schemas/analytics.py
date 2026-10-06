from pydantic import BaseModel


class AdminAnalyticsRead(BaseModel):
    coffee_count: int
    paid_order_count: int
    gross_sales_cents: int
    low_stock_count: int
    active_subscription_count: int
    paid_wholesale_count: int
