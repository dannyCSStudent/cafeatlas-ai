from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin_user_id, get_current_user_id
from app.db.session import get_db_session
from app.repositories.affiliate import create_affiliate, get_affiliate
from app.schemas.affiliate import AffiliateAdminRead, AffiliateApplyRead, AffiliateRead, AffiliateUpdate
from sqlalchemy import select
from app.models.affiliate import Affiliate

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


@router.get("/admin", response_model=list[AffiliateAdminRead])
def admin_affiliates(
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> list[AffiliateAdminRead]:
    records = session.scalars(select(Affiliate).order_by(Affiliate.created_at.desc(), Affiliate.id.desc())).all()
    return [AffiliateAdminRead.model_validate(record) for record in records]


@router.patch("/admin/{affiliate_id}", response_model=AffiliateAdminRead)
def admin_update_affiliate(
    affiliate_id: int,
    payload: AffiliateUpdate,
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> AffiliateAdminRead:
    record = session.get(Affiliate, affiliate_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    record.status = payload.status
    record.commission_rate_bps = payload.commission_rate_bps
    session.commit()
    session.refresh(record)
    return AffiliateAdminRead.model_validate(record)
