from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.api.v1.orders import create_order, update_shipping
from app.repositories.orders import get_order, update_fulfillment
from app.db.base import Base
from app.models.coffee import Coffee
from app.models.order import Order
from app.schemas.checkout import CheckoutLineCreate
from app.schemas.order import FulfillmentUpdate, OrderCreate, ShippingAddressUpdate


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


def test_update_shipping_scopes_order_and_adds_shipping_estimate(settings) -> None:
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
        order = create_order(
            OrderCreate(items=[CheckoutLineCreate(coffee_id=coffee.id, quantity=1)]),
            session,
            "supabase-user-123",
        )

        response = update_shipping(
            order.id,
            ShippingAddressUpdate(
                recipient_name="Alicia",
                address_line1="123 Main St",
                city="Austin",
                region="TX",
                postal_code="78701",
                country_code="us",
            ),
            session,
            "supabase-user-123",
        )

    assert response.shipping_cents == 699
    assert response.total_cents == 3099
    assert response.country_code == "US"


def test_update_shipping_uses_mexico_rate(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        coffee = Coffee(
            name="Mexico Shipping Coffee",
            slug="mexico-shipping-coffee",
            origin_state="Veracruz",
            producer_name="Finca Atlas",
            inventory_units=8,
            price_cents=2400,
        )
        session.add(coffee)
        session.commit()
        order = create_order(
            OrderCreate(items=[CheckoutLineCreate(coffee_id=coffee.id, quantity=1)]),
            session,
            "supabase-user-123",
        )

        response = update_shipping(
            order.id,
            ShippingAddressUpdate(
                recipient_name="Alicia",
                address_line1="Avenida Reforma 123",
                city="Mexico City",
                region="CDMX",
                postal_code="06600",
                country_code="mx",
            ),
            session,
            "supabase-user-123",
        )

    assert response.shipping_cents == 1299
    assert response.country_code == "MX"


def test_fulfillment_requires_ordered_status_transitions(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        from app.models.order import Order

        order = Order(user_id="user-1", status="paid", subtotal_cents=2400, total_cents=2400)
        session.add(order)
        session.commit()

        updated = update_fulfillment(session, order.id, FulfillmentUpdate(status="processing"))

        assert updated.status == "processing"
    assert update_fulfillment(session, order.id, FulfillmentUpdate(status="shipped", tracking_number="TRACK-1")).tracking_number == "TRACK-1"


def test_get_order_scopes_receipt_data_to_owner(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        order = Order(user_id="user-1", status="paid", subtotal_cents=2400, total_cents=2400)
        session.add(order)
        session.commit()

        assert get_order(session, order.id, "user-1").id == order.id
        from fastapi import HTTPException

        try:
            get_order(session, order.id, "user-2")
        except HTTPException as error:
            assert error.status_code == 404
        else:
            raise AssertionError("A customer must not access another customer's order")
