from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.coffee import Coffee
from app.models.order import Order
from app.models.subscription import Subscription
from app.models.wholesale_request import WholesaleRequest


PAID_ORDER_STATUSES = ("paid", "processing", "shipped", "delivered")


def get_admin_analytics(session: Session) -> dict[str, int]:
    return {
        "coffee_count": int(session.scalar(select(func.count(Coffee.id))) or 0),
        "paid_order_count": int(session.scalar(select(func.count(Order.id)).where(Order.status.in_(PAID_ORDER_STATUSES))) or 0),
        "gross_sales_cents": int(session.scalar(select(func.coalesce(func.sum(Order.total_cents), 0)).where(Order.status.in_(PAID_ORDER_STATUSES))) or 0),
        "low_stock_count": int(session.scalar(select(func.count(Coffee.id)).where(Coffee.inventory_units <= 5)) or 0),
        "active_subscription_count": int(session.scalar(select(func.count(Subscription.id)).where(Subscription.status == "active")) or 0),
        "paid_wholesale_count": int(session.scalar(select(func.count(WholesaleRequest.id)).where(WholesaleRequest.status == "paid")) or 0),
    }
