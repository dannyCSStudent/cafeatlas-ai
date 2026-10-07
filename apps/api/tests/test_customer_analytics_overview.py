from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.order import Order, OrderItem
from app.repositories.analytics import get_customer_analytics_overview


def test_customer_analytics_overview_reports_ltv_repeat_customers_and_top_coffee() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        first = Order(user_id="user-1", status="paid", subtotal_cents=2000, total_cents=2000)
        first.items = [OrderItem(coffee_id=1, coffee_name="Atlas Select", coffee_slug="atlas-select", quantity=2, unit_price_cents=1000, line_total_cents=2000)]
        second = Order(user_id="user-1", status="paid", subtotal_cents=3000, total_cents=3000)
        second.items = [OrderItem(coffee_id=1, coffee_name="Atlas Select", coffee_slug="atlas-select", quantity=3, unit_price_cents=1000, line_total_cents=3000)]
        other = Order(user_id="user-2", status="draft", subtotal_cents=9000, total_cents=9000)
        session.add_all([first, second, other])
        session.commit()
        result = get_customer_analytics_overview(session)

    assert result["paying_customer_count"] == 1
    assert result["repeat_customer_count"] == 1
    assert result["lifetime_value_cents"] == 5000
    assert result["average_lifetime_value_cents"] == 5000
    assert result["most_purchased_coffee"] == "Atlas Select"
