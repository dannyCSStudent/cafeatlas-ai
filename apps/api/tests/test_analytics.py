from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.coffee import Coffee
from app.models.order import Order
from app.repositories.analytics import get_admin_analytics


def test_admin_analytics_counts_paid_sales_and_low_stock() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all([
            Coffee(name="Low", slug="low", origin_state="Oaxaca", producer_name="Atlas", inventory_units=3, price_cents=1000),
            Coffee(name="Healthy", slug="healthy", origin_state="Chiapas", producer_name="Atlas", inventory_units=20, price_cents=1000),
            Order(user_id="user-1", status="paid", subtotal_cents=2400, shipping_cents=699, tax_cents=0, total_cents=3099),
            Order(user_id="user-1", status="draft", subtotal_cents=9900, shipping_cents=0, tax_cents=0, total_cents=9900),
        ])
        session.commit()
        result = get_admin_analytics(session)

    assert result["coffee_count"] == 2
    assert result["paid_order_count"] == 1
    assert result["gross_sales_cents"] == 3099
    assert result["low_stock_count"] == 1
