import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.order import Order
from app.models.return_request import ReturnRequest
from app.repositories.return_requests import create_return_request, update_return_request
from app.schemas.return_request import ReturnRequestCreate, ReturnRequestUpdate


def test_customer_can_request_one_return_for_a_delivered_order() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        order = Order(user_id="user-1", status="delivered", subtotal_cents=2400, total_cents=2400)
        session.add(order)
        session.commit()

        request = create_return_request(
            session,
            order.id,
            "user-1",
            ReturnRequestCreate(reason="The package arrived damaged and cannot be used."),
        )

        assert request.status == "pending"
        with pytest.raises(HTTPException) as duplicate:
            create_return_request(
                session,
                order.id,
                "user-1",
                ReturnRequestCreate(reason="I would like to return this order."),
            )

    assert duplicate.value.status_code == 409


def test_return_request_requires_delivery_and_admin_resolution() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        order = Order(user_id="user-1", status="shipped", subtotal_cents=2400, total_cents=2400)
        session.add(order)
        session.commit()

        with pytest.raises(HTTPException) as not_delivered:
            create_return_request(
                session,
                order.id,
                "user-1",
                ReturnRequestCreate(reason="The order is no longer needed."),
            )

        delivered = Order(user_id="user-2", status="delivered", subtotal_cents=2400, total_cents=2400)
        session.add(delivered)
        session.commit()
        request = create_return_request(
            session,
            delivered.id,
            "user-2",
            ReturnRequestCreate(reason="The flavor profile was not a good fit for me."),
        )
        resolved = update_return_request(session, request.id, ReturnRequestUpdate(status="approved"))
        stored = session.get(ReturnRequest, request.id)

    assert not_delivered.value.status_code == 409
    assert resolved.status == "approved"
    assert stored is not None
    assert stored.status == "approved"
