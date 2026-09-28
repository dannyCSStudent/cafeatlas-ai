from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.api.v1.orders import create_order
from app.db.base import Base
from app.models.coffee import Coffee
from app.models.order import Order
from app.schemas.checkout import CheckoutLineCreate
from app.schemas.order import OrderCreate


def test_create_order_draft_snapshots_current_price_and_owner(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        coffee = Coffee(
            name="Sierra Negra",
            slug="sierra-negra",
            origin_state="Chiapas",
            producer_name="Finca La Esperanza",
            inventory_units=8,
            price_cents=2400,
        )
        session.add(coffee)
        session.commit()

        response = create_order(
            OrderCreate(items=[CheckoutLineCreate(coffee_id=coffee.id, quantity=2)]),
            session,
            "supabase-user-123",
        )

        stored = session.get(Order, response.id)

    assert response.status == "draft"
    assert response.total_cents == 4800
    assert response.items[0].coffee_name == "Sierra Negra"
    assert stored is not None
    assert stored.user_id == "supabase-user-123"
