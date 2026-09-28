import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.api.v1.checkout import prepare_checkout
from app.db.base import Base
from app.models.coffee import Coffee
from app.schemas.checkout import CheckoutLineCreate, CheckoutPrepareRequest


def _coffee(session: Session, *, inventory_units: int = 8) -> Coffee:
    coffee = Coffee(
        name="Sierra Negra",
        slug="sierra-negra",
        origin_state="Chiapas",
        producer_name="Finca La Esperanza",
        inventory_units=inventory_units,
        price_cents=2400,
    )
    session.add(coffee)
    session.commit()
    return coffee


def test_prepare_checkout_reprices_from_database(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        coffee = _coffee(session)
        response = prepare_checkout(
            CheckoutPrepareRequest(items=[CheckoutLineCreate(coffee_id=coffee.id, quantity=2)]),
            session,
        )

    assert response.subtotal_cents == 4800
    assert response.total_cents == 4800
    assert response.items[0].unit_price_cents == 2400
    assert response.checkout_ready is False


def test_prepare_checkout_rejects_insufficient_inventory(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        coffee = _coffee(session, inventory_units=1)
        with pytest.raises(HTTPException) as exc_info:
            prepare_checkout(
                CheckoutPrepareRequest(items=[CheckoutLineCreate(coffee_id=coffee.id, quantity=2)]),
                session,
            )

    assert exc_info.value.status_code == 409


def test_prepare_checkout_rejects_missing_coffee(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        with pytest.raises(HTTPException) as exc_info:
            prepare_checkout(
                CheckoutPrepareRequest(items=[CheckoutLineCreate(coffee_id=999, quantity=1)]),
                session,
            )

    assert exc_info.value.status_code == 404


def test_checkout_request_rejects_duplicate_coffees() -> None:
    with pytest.raises(ValueError, match="only once"):
        CheckoutPrepareRequest(
            items=[
                CheckoutLineCreate(coffee_id=1, quantity=1),
                CheckoutLineCreate(coffee_id=1, quantity=2),
            ]
        )
