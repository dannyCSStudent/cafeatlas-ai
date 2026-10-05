from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.repositories.affiliate import create_affiliate, get_affiliate


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
