from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.db.session import get_db_session
from app.repositories.affiliate import create_affiliate, get_affiliate
from app.schemas.affiliate import AffiliateApplyRead, AffiliateRead

router = APIRouter(prefix="/affiliate", tags=["affiliate"])


@router.get("", response_model=AffiliateRead | None)
def affiliate(
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> AffiliateRead | None:
    record = get_affiliate(session, user_id)
    return AffiliateRead.model_validate(record) if record else None


@router.post("/apply", response_model=AffiliateApplyRead, status_code=status.HTTP_201_CREATED)
def apply_for_affiliate(
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> AffiliateApplyRead:
    record = create_affiliate(session, user_id)
    return AffiliateApplyRead(
        affiliate=AffiliateRead.model_validate(record),
        referral_url=f"/coffees?ref={record.referral_code}",
    )
