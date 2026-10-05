from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.coffee import Coffee
from app.models.affiliate_commission import AffiliateCommission
from app.repositories.affiliate import create_affiliate, get_affiliate
from app.repositories.orders import create_order_draft
from app.schemas.checkout import CheckoutLineCreate
from app.schemas.order import OrderCreate


def test_affiliate_application_creates_requested_profile_with_referral_code() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        affiliate = create_affiliate(session, "user-1")
        stored = get_affiliate(session, "user-1")

    assert stored is not None
    assert stored.id == affiliate.id
    assert stored.status == "requested"
    assert stored.referral_code.startswith("atlas-")
    assert len(stored.referral_code) == 14
    assert stored.commission_rate_bps == 1000


def test_active_affiliate_code_is_attributed_to_order() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        affiliate = create_affiliate(session, "affiliate-user")
        affiliate.status = "active"
        affiliate_id = affiliate.id
        coffee = Coffee(
            name="Referral Coffee",
            slug="referral-coffee",
            origin_state="Chiapas",
            producer_name="Finca Atlas",
            inventory_units=10,
            price_cents=2400,
        )
        session.add(coffee)
        session.commit()

        order = create_order_draft(
            session,
            "customer-user",
            OrderCreate(
                items=[CheckoutLineCreate(coffee_id=coffee.id, quantity=1)],
                referral_code=affiliate.referral_code,
            ),
        )

    assert order.affiliate_id == affiliate_id


def test_paid_attributed_order_creates_one_pending_commission() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        affiliate = create_affiliate(session, "affiliate-user")
        affiliate.status = "active"
        affiliate_id = affiliate.id
        coffee = Coffee(
            name="Commission Coffee",
            slug="commission-coffee",
            origin_state="Oaxaca",
            producer_name="Finca Atlas",
            inventory_units=10,
            price_cents=2500,
        )
        session.add(coffee)
        session.commit()
        order = create_order_draft(
            session,
            "customer-user",
            OrderCreate(items=[CheckoutLineCreate(coffee_id=coffee.id, quantity=2)], referral_code=affiliate.referral_code),
        )
        order.stripe_session_id = "cs_commission"
        session.commit()

        from app.repositories.orders import complete_order_from_stripe

        complete_order_from_stripe(session, "cs_commission", True)
        complete_order_from_stripe(session, "cs_commission", True)
        commissions = session.query(AffiliateCommission).all()

    assert len(commissions) == 1
    assert commissions[0].affiliate_id == affiliate_id
    assert commissions[0].amount_cents == 500
    assert commissions[0].status == "pending"
