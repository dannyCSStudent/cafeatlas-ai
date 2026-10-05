from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin_user_id, get_current_user_id
from app.core import stripe as stripe_client
from app.core.settings import Settings, get_settings
from app.db.session import get_db_session
from app.models.wholesale_request import WholesaleRequest
from app.models.wholesale_request_item import WholesaleRequestItem
from app.models.wholesale_pricing_tier import WholesalePricingTier
from app.models.coffee import Coffee
from app.models.wholesale_account import WholesaleAccount
from app.schemas.wholesale_request import (
    WholesaleRequestAdminRead,
    WholesaleRequestAdminUpdate,
    WholesaleCheckoutCreate,
    WholesaleRequestCreate,
    WholesaleRequestRead,
)
from app.schemas.wholesale_account import WholesaleAccountPayload, WholesaleAccountRead
from app.schemas.wholesale_pricing_tier import WholesalePricingTierPayload, WholesalePricingTierRead

router = APIRouter(tags=["wholesale"])


@router.get("/wholesale/pricing-tiers", response_model=list[WholesalePricingTierRead])
def wholesale_pricing_tiers(
    _user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_db_session),
) -> list[WholesalePricingTierRead]:
    tiers = session.scalars(select(WholesalePricingTier).where(WholesalePricingTier.active.is_(True)).order_by(WholesalePricingTier.min_boxes.asc())).all()
    return [WholesalePricingTierRead.model_validate(tier) for tier in tiers]


@router.get("/admin/wholesale/pricing-tiers", response_model=list[WholesalePricingTierRead])
def admin_wholesale_pricing_tiers(
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> list[WholesalePricingTierRead]:
    tiers = session.scalars(select(WholesalePricingTier).order_by(WholesalePricingTier.min_boxes.asc())).all()
    return [WholesalePricingTierRead.model_validate(tier) for tier in tiers]


@router.post("/admin/wholesale/pricing-tiers", response_model=WholesalePricingTierRead, status_code=status.HTTP_201_CREATED)
def create_admin_wholesale_pricing_tier(
    payload: WholesalePricingTierPayload,
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> WholesalePricingTierRead:
    if payload.max_boxes is not None and payload.max_boxes < payload.min_boxes:
        raise HTTPException(status_code=422, detail="Maximum boxes must be greater than or equal to minimum boxes")
    tier_data = payload.model_dump()
    tier_data["name"] = payload.name.strip()
    tier_data["currency_code"] = payload.currency_code.upper()
    tier = WholesalePricingTier(**tier_data)
    session.add(tier)
    session.commit()
    session.refresh(tier)
    return WholesalePricingTierRead.model_validate(tier)


@router.patch("/admin/wholesale/pricing-tiers/{tier_id}", response_model=WholesalePricingTierRead)
def update_admin_wholesale_pricing_tier(
    tier_id: int,
    payload: WholesalePricingTierPayload,
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> WholesalePricingTierRead:
    if payload.max_boxes is not None and payload.max_boxes < payload.min_boxes:
        raise HTTPException(status_code=422, detail="Maximum boxes must be greater than or equal to minimum boxes")
    tier = session.get(WholesalePricingTier, tier_id)
    if tier is None:
        raise HTTPException(status_code=404, detail="Pricing tier not found")
    tier.name = payload.name.strip()
    tier.min_boxes = payload.min_boxes
    tier.max_boxes = payload.max_boxes
    tier.price_per_box_cents = payload.price_per_box_cents
    tier.currency_code = payload.currency_code.upper()
    tier.active = payload.active
    session.commit()
    session.refresh(tier)
    return WholesalePricingTierRead.model_validate(tier)


@router.get("/wholesale/account", response_model=WholesaleAccountRead | None)
def wholesale_account(
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> WholesaleAccountRead | None:
    account = session.scalar(select(WholesaleAccount).where(WholesaleAccount.user_id == user_id))
    return WholesaleAccountRead.model_validate(account) if account else None


@router.put("/wholesale/account", response_model=WholesaleAccountRead)
def save_wholesale_account(
    payload: WholesaleAccountPayload,
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> WholesaleAccountRead:
    account = session.scalar(select(WholesaleAccount).where(WholesaleAccount.user_id == user_id))
    if account is None:
        account = WholesaleAccount(user_id=user_id)
        session.add(account)
    account.company_name = payload.company_name.strip()
    account.contact_name = payload.contact_name.strip()
    account.billing_email = payload.billing_email.strip().lower()
    account.country_code = payload.country_code.upper()
    session.commit()
    session.refresh(account)
    return WholesaleAccountRead.model_validate(account)


@router.get("/wholesale/requests", response_model=list[WholesaleRequestRead])
def wholesale_requests(session: Session = Depends(get_db_session), user_id: str = Depends(get_current_user_id)) -> list[WholesaleRequestRead]:
    items = session.scalars(select(WholesaleRequest).where(WholesaleRequest.user_id == user_id).order_by(WholesaleRequest.created_at.desc())).all()
    return [WholesaleRequestRead.model_validate(item) for item in items]


@router.post("/wholesale/requests", response_model=WholesaleRequestRead, status_code=status.HTTP_201_CREATED)
def create_wholesale_request(payload: WholesaleRequestCreate, session: Session = Depends(get_db_session), user_id: str = Depends(get_current_user_id)) -> WholesaleRequestRead:
    coffee_ids = [item.coffee_id for item in payload.items]
    if len(coffee_ids) != len(set(coffee_ids)):
        raise HTTPException(status_code=422, detail="Each coffee can only be selected once")
    coffees = {coffee.id: coffee for coffee in session.scalars(select(Coffee).where(Coffee.id.in_(coffee_ids))).all()}
    missing_ids = [coffee_id for coffee_id in coffee_ids if coffee_id not in coffees]
    if missing_ids:
        raise HTTPException(status_code=404, detail=f"Coffee not found: {missing_ids[0]}")
    request = WholesaleRequest(user_id=user_id, company_name=payload.company_name.strip(), contact_name=payload.contact_name.strip(), estimated_boxes=payload.estimated_boxes, delivery_country=payload.delivery_country.upper(), note=payload.note.strip(), coffee_preferences=payload.coffee_preferences.strip() if payload.coffee_preferences else None, items=[WholesaleRequestItem(coffee_id=item.coffee_id, coffee_name=coffees[item.coffee_id].name, coffee_slug=coffees[item.coffee_id].slug, quantity_boxes=item.quantity_boxes) for item in payload.items])
    session.add(request)
    session.commit()
    session.refresh(request)
    return WholesaleRequestRead.model_validate(request)


@router.post("/wholesale/requests/{request_id}/checkout")
def wholesale_checkout(
    request_id: int,
    payload: WholesaleCheckoutCreate,
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
    settings: Settings = Depends(get_settings),
) -> dict[str, str | int]:
    request = session.scalar(select(WholesaleRequest).where(WholesaleRequest.id == request_id, WholesaleRequest.user_id == user_id))
    if request is None:
        raise HTTPException(status_code=404, detail="Wholesale request not found")
    if request.status != "approved":
        raise HTTPException(status_code=409, detail="Wholesale request must be approved before payment")
    session_id, checkout_url = stripe_client.create_wholesale_checkout_session(settings, request, payload.success_url, payload.cancel_url)
    request.status = "payment_pending"
    request.stripe_session_id = session_id
    session.commit()
    return {"request_id": request.id, "session_id": session_id, "checkout_url": checkout_url}


@router.get("/admin/wholesale/requests", response_model=list[WholesaleRequestAdminRead])
def admin_wholesale_requests(
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> list[WholesaleRequestAdminRead]:
    items = session.scalars(select(WholesaleRequest).order_by(WholesaleRequest.created_at.desc())).all()
    return [WholesaleRequestAdminRead.model_validate(item) for item in items]


@router.patch("/admin/wholesale/requests/{request_id}", response_model=WholesaleRequestAdminRead)
def update_admin_wholesale_request(
    request_id: int,
    payload: WholesaleRequestAdminUpdate,
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> WholesaleRequestAdminRead:
    request = session.get(WholesaleRequest, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Wholesale request not found")
    if payload.status is not None:
        request.status = payload.status
    if payload.quote_total_cents is not None:
        request.quote_total_cents = payload.quote_total_cents
    if payload.price_per_box_cents is not None:
        request.price_per_box_cents = payload.price_per_box_cents
    if payload.quote_note is not None:
        request.quote_note = payload.quote_note.strip()
    if payload.tracking_number is not None:
        request.tracking_number = payload.tracking_number.strip()
    if payload.tracking_url is not None:
        request.tracking_url = payload.tracking_url.strip()
    from datetime import datetime, timezone
    if payload.status in {"shipped", "delivered"}:
        request.shipped_at = request.shipped_at or datetime.now(timezone.utc)
    if payload.status == "delivered":
        request.delivered_at = datetime.now(timezone.utc)
    if payload.status is None and payload.tracking_number is not None and request.status == "paid":
        request.status = "shipped"
    if any(value is not None for value in (payload.quote_total_cents, payload.price_per_box_cents, payload.quote_note)):
        from datetime import datetime, timezone
        request.quoted_at = datetime.now(timezone.utc)
        if payload.status is None and request.status == "requested":
            request.status = "quoted"
    session.commit()
    session.refresh(request)
    return WholesaleRequestAdminRead.model_validate(request)
