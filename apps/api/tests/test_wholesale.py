import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.api.v1.wholesale import create_wholesale_request, update_admin_wholesale_request, wholesale_checkout
from app.db.base import Base
from app.models.wholesale_request import WholesaleRequest
from app.schemas.wholesale_request import WholesaleCheckoutCreate, WholesaleRequestAdminUpdate, WholesaleRequestCreate


def _session() -> Session:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    return Session(engine)


def test_create_wholesale_request_scopes_owner_and_defaults_status() -> None:
    with _session() as session:
        response = create_wholesale_request(
            WholesaleRequestCreate(
                company_name="Cafe North",
                contact_name="Alicia",
                estimated_boxes=12,
                delivery_country="us",
                note="Monthly office program",
            ),
            session,
            "user-1",
        )

    assert response.status == "requested"
    assert response.delivery_country == "US"
    assert response.quote_total_cents is None


def test_admin_quote_update_sets_quoted_status() -> None:
    with _session() as session:
        request = WholesaleRequest(
            user_id="user-1",
            company_name="Cafe North",
            contact_name="Alicia",
            estimated_boxes=12,
            delivery_country="US",
            note="Monthly office program",
        )
        session.add(request)
        session.commit()

        response = update_admin_wholesale_request(
            request.id,
            WholesaleRequestAdminUpdate(
                quote_total_cents=120000,
                price_per_box_cents=10000,
                quote_note="Valid for 14 days",
            ),
            "admin-1",
            session,
        )

    assert response.status == "quoted"
    assert response.quote_total_cents == 120000
    assert response.price_per_box_cents == 10000


def test_wholesale_checkout_requires_approval(monkeypatch) -> None:
    with _session() as session:
        request = WholesaleRequest(
            user_id="user-1",
            company_name="Cafe North",
            contact_name="Alicia",
            estimated_boxes=12,
            delivery_country="US",
            note="Monthly office program",
            status="approved",
            quote_total_cents=120000,
        )
        session.add(request)
        session.commit()
        monkeypatch.setattr(
            "app.api.v1.wholesale.stripe_client.create_wholesale_checkout_session",
            lambda settings, request, success_url, cancel_url: ("cs_test_wholesale", "https://checkout.stripe.test/session"),
        )

        response = wholesale_checkout(
            request.id,
            WholesaleCheckoutCreate(success_url="http://localhost/success", cancel_url="http://localhost/cancel"),
            session,
            "user-1",
            object(),
        )
        stored = session.get(WholesaleRequest, request.id)

    assert response["session_id"] == "cs_test_wholesale"
    assert stored is not None
    assert stored.status == "payment_pending"
    assert stored.stripe_session_id == "cs_test_wholesale"


def test_wholesale_checkout_rejects_unapproved_request() -> None:
    with _session() as session:
        request = WholesaleRequest(
            user_id="user-1",
            company_name="Cafe North",
            contact_name="Alicia",
            estimated_boxes=12,
            delivery_country="US",
            note="Monthly office program",
        )
        session.add(request)
        session.commit()

        with pytest.raises(HTTPException) as exc_info:
            wholesale_checkout(
                request.id,
                WholesaleCheckoutCreate(success_url="http://localhost/success", cancel_url="http://localhost/cancel"),
                session,
                "user-1",
                object(),
            )

    assert exc_info.value.status_code == 409
