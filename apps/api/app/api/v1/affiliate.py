from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin_user_id, get_current_user_id
from app.db.session import get_db_session
from app.repositories.affiliate import create_affiliate, get_affiliate
from app.models.affiliate import Affiliate
from app.models.affiliate_commission import AffiliateCommission
from app.models.affiliate_click import AffiliateClick
from app.schemas.affiliate import AffiliateAdminRead, AffiliateApplyRead, AffiliateClickCreate, AffiliateCommissionRead, AffiliateCommissionUpdate, AffiliateDashboardRead, AffiliateRead, AffiliateUpdate

router = APIRouter(prefix="/affiliate", tags=["affiliate"])


def commission_summary(session: Session, affiliate_id: int) -> dict[str, int]:
    summary = {
        "pending_commission_cents": 0,
        "approved_commission_cents": 0,
        "paid_commission_cents": 0,
        "attributed_order_count": 0,
        "click_count": 0,
    }
    rows = session.execute(
        select(
            AffiliateCommission.status,
            func.coalesce(func.sum(AffiliateCommission.amount_cents), 0),
            func.count(AffiliateCommission.id),
        )
        .where(AffiliateCommission.affiliate_id == affiliate_id)
        .group_by(AffiliateCommission.status)
    ).all()
    for status_name, total, count in rows:
        key = f"{status_name}_commission_cents"
        if key in summary:
            summary[key] = int(total)
        summary["attributed_order_count"] += int(count)
    summary["click_count"] = int(
        session.scalar(select(func.count(AffiliateClick.id)).where(AffiliateClick.affiliate_id == affiliate_id)) or 0
    )
    return summary


@router.get("", response_model=AffiliateDashboardRead | None)
def affiliate(
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> AffiliateDashboardRead | None:
    record = get_affiliate(session, user_id)
    if record is None:
        return None
    return AffiliateDashboardRead(
        affiliate=AffiliateRead.model_validate(record),
        referral_url=f"/coffees?ref={record.referral_code}",
        **commission_summary(session, record.id),
    )


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


@router.post("/click", status_code=status.HTTP_204_NO_CONTENT)
def record_click(payload: AffiliateClickCreate, session: Session = Depends(get_db_session)) -> None:
    affiliate = session.scalar(
        select(Affiliate).where(
            Affiliate.referral_code == payload.referral_code.strip().lower(),
            Affiliate.status == "active",
        )
    )
    if affiliate is None:
        return
    session.add(AffiliateClick(affiliate_id=affiliate.id, landing_path=payload.landing_path))
    session.commit()


@router.get("/admin", response_model=list[AffiliateAdminRead])
def admin_affiliates(
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> list[AffiliateAdminRead]:
    records = session.scalars(select(Affiliate).order_by(Affiliate.created_at.desc(), Affiliate.id.desc())).all()
    return [
        AffiliateAdminRead(
            user_id=record.user_id,
            **AffiliateRead.model_validate(record).model_dump(),
            **commission_summary(session, record.id),
        )
        for record in records
    ]


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
    return AffiliateAdminRead(
        user_id=record.user_id,
        **AffiliateRead.model_validate(record).model_dump(),
        **commission_summary(session, record.id),
    )


@router.get("/admin/commissions", response_model=list[AffiliateCommissionRead])
def admin_commissions(
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> list[AffiliateCommissionRead]:
    records = session.scalars(
        select(AffiliateCommission).order_by(AffiliateCommission.created_at.desc(), AffiliateCommission.id.desc())
    ).all()
    return [AffiliateCommissionRead.model_validate(record) for record in records]


@router.patch("/admin/commissions/{commission_id}", response_model=AffiliateCommissionRead)
def admin_update_commission(
    commission_id: int,
    payload: AffiliateCommissionUpdate,
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> AffiliateCommissionRead:
    record = session.get(AffiliateCommission, commission_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Commission not found")
    allowed_transitions = {"pending": "approved", "approved": "paid"}
    if allowed_transitions.get(record.status) != payload.status:
        raise HTTPException(status_code=409, detail=f"Cannot move commission from {record.status} to {payload.status}")
    record.status = payload.status
    session.commit()
    session.refresh(record)
    return AffiliateCommissionRead.model_validate(record)
