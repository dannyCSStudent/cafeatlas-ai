from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.order import Order
from app.models.subscription import Subscription
from app.repositories.analytics import get_customer_analytics


def test_customer_analytics_scopes_paid_orders_and_subscription() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all([
            Order(user_id="user-1", status="paid", subtotal_cents=2000, shipping_cents=699, tax_cents=0, total_cents=2699),
            Order(user_id="user-1", status="draft", subtotal_cents=9000, shipping_cents=0, tax_cents=0, total_cents=9000),
            Order(user_id="user-2", status="paid", subtotal_cents=9999, shipping_cents=0, tax_cents=0, total_cents=9999),
            Subscription(user_id="user-1", plan="origin", status="active", stripe_subscription_id="sub_1", price_id="price_1"),
        ])
        session.commit()
        result = get_customer_analytics(session, "user-1")

    assert result["paid_order_count"] == 1
    assert result["lifetime_spend_cents"] == 2699
    assert result["average_order_cents"] == 2699
    assert result["active_subscription"] is True
    assert result["latest_purchase_at"] is not None
