from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.order import Order
from app.repositories.rewards import get_rewards


def test_rewards_count_paid_orders_and_ignore_unpaid_orders() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all([
            Order(user_id="user-1", status="paid", subtotal_cents=22000, total_cents=22000),
            Order(user_id="user-1", status="draft", subtotal_cents=50000, total_cents=50000),
            Order(user_id="user-2", status="paid", subtotal_cents=100000, total_cents=100000),
        ])
        session.commit()
        result = get_rewards(session, "user-1")

    assert result == {"points": 220, "tier": "Taster", "next_tier": "Curator", "points_to_next_tier": 80, "qualifying_orders": 1}
