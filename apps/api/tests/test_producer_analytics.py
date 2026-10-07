from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.coffee import Coffee
from app.models.order import Order, OrderItem
from app.models.producer import Producer
from app.repositories.analytics import get_producer_analytics


def test_producer_analytics_reports_sales_inventory_and_top_coffee() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        producer = Producer(name="Atlas Producer", slug="atlas-producer")
        coffee = Coffee(
            producer=producer,
            name="Atlas Select",
            slug="atlas-select",
            origin_state="Chiapas",
            producer_name="Atlas Producer",
            inventory_units=7,
            price_cents=2500,
        )
        session.add_all([producer, coffee])
        session.flush()
        order = Order(user_id="user-1", status="paid", subtotal_cents=5000, total_cents=5000, created_at=datetime(2026, 9, 15, tzinfo=timezone.utc))
        order.items = [OrderItem(coffee_id=coffee.id, coffee_name="Atlas Select", coffee_slug="atlas-select", quantity=2, unit_price_cents=2500, line_total_cents=5000)]
        session.add(order)
        session.commit()
        producer_id = producer.id
        result = get_producer_analytics(session)

    assert result == [{
        "producer_id": producer_id,
        "producer_name": "Atlas Producer",
        "coffee_count": 1,
        "current_inventory_units": 7,
        "paid_units_sold": 2,
        "paid_sales_cents": 5000,
        "top_coffee_name": "Atlas Select",
        "monthly_sales": [{"month": "2026-09", "units_sold": 2, "sales_cents": 5000}],
    }]
