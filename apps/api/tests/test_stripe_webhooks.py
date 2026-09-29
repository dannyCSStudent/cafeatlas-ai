import hashlib
import hmac
import json
import time

import pytest
from fastapi import HTTPException

from app.core.stripe import verify_webhook_signature
from app.db.base import Base
from app.models.coffee import Coffee
from app.models.order import Order, OrderItem
from app.repositories.orders import complete_order_from_stripe
from sqlalchemy import create_engine
from sqlalchemy.orm import Session


def test_verify_webhook_signature_accepts_valid_payload() -> None:
    payload = json.dumps({"type": "checkout.session.completed"}).encode()
    timestamp = str(int(time.time()))
    digest = hmac.new(b"whsec_test", f"{timestamp}.".encode() + payload, hashlib.sha256).hexdigest()

    event = verify_webhook_signature(payload, f"t={timestamp},v1={digest}", "whsec_test")

    assert event["type"] == "checkout.session.completed"


def test_verify_webhook_signature_rejects_tampering() -> None:
    with pytest.raises(HTTPException) as exc_info:
        verify_webhook_signature(b"{}", "t=1,v1=bad", "whsec_test")

    assert exc_info.value.status_code == 400


def test_completed_order_decrements_inventory_once() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        coffee = Coffee(
            name="Sierra Negra",
            slug="sierra-negra",
            origin_state="Chiapas",
            producer_name="Finca La Esperanza",
            inventory_units=5,
            price_cents=2400,
        )
        session.add(coffee)
        session.flush()
        order = Order(
            user_id="user-1",
            status="checkout_pending",
            stripe_session_id="cs_test_123",
            subtotal_cents=4800,
            total_cents=4800,
            items=[OrderItem(coffee_id=coffee.id, coffee_name=coffee.name, coffee_slug=coffee.slug, quantity=2, unit_price_cents=2400, line_total_cents=4800)],
        )
        session.add(order)
        session.commit()

        completed = complete_order_from_stripe(session, "cs_test_123", True)
        duplicate = complete_order_from_stripe(session, "cs_test_123", True)
        session.refresh(coffee)

    assert completed is not None
    assert completed.status == "paid"
    assert duplicate is not None
    assert coffee.inventory_units == 3
