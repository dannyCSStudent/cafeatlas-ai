import secrets
import string

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.affiliate import Affiliate


def get_affiliate(session: Session, user_id: str) -> Affiliate | None:
    return session.scalar(select(Affiliate).where(Affiliate.user_id == user_id))


def create_affiliate(session: Session, user_id: str) -> Affiliate:
    existing = get_affiliate(session, user_id)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Affiliate application already exists")

    alphabet = string.ascii_lowercase + string.digits
    referral_code = "atlas-" + "".join(secrets.choice(alphabet) for _ in range(8))
    affiliate = Affiliate(user_id=user_id, referral_code=referral_code, status="requested")
    session.add(affiliate)
    session.commit()
    session.refresh(affiliate)
    return affiliate
