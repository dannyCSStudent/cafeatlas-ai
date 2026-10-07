from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin_user_id
from app.db.session import get_db_session
from app.models.marketplace_product import MarketplaceProduct
from app.repositories.marketplace_products import list_marketplace_products
from app.schemas.marketplace_product import (
    MARKETPLACE_CATEGORIES,
    MarketplaceProductCreate,
    MarketplaceProductRead,
    MarketplaceProductUpdate,
)


router = APIRouter(prefix="/admin/marketplace/products", tags=["admin-marketplace"])


def validate_category(category: str) -> str:
    if category not in MARKETPLACE_CATEGORIES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid marketplace category")
    return category


@router.get("", response_model=list[MarketplaceProductRead])
def admin_marketplace_products(
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> list[MarketplaceProductRead]:
    return [MarketplaceProductRead.model_validate(product) for product in list_marketplace_products(session, page=1, page_size=100, sort="newest")]


@router.post("", response_model=MarketplaceProductRead, status_code=status.HTTP_201_CREATED)
def create_admin_marketplace_product(
    payload: MarketplaceProductCreate,
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> MarketplaceProductRead:
    validate_category(payload.category)
    if session.scalar(select(MarketplaceProduct.id).where(MarketplaceProduct.slug == payload.slug)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Marketplace product slug already exists")
    data = payload.model_dump()
    data.update({"category": payload.category, "currency_code": payload.currency_code.upper(), "name": payload.name.strip(), "slug": payload.slug.strip().lower()})
    product = MarketplaceProduct(**data)
    session.add(product)
    session.commit()
    session.refresh(product)
    return MarketplaceProductRead.model_validate(product)


@router.patch("/{product_id}", response_model=MarketplaceProductRead)
def update_admin_marketplace_product(
    product_id: int,
    payload: MarketplaceProductUpdate,
    _admin_user_id: str = Depends(get_current_admin_user_id),
    session: Session = Depends(get_db_session),
) -> MarketplaceProductRead:
    product = session.get(MarketplaceProduct, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marketplace product not found")
    for field, value in payload.model_dump().items():
        setattr(product, field, value)
    session.commit()
    session.refresh(product)
    return MarketplaceProductRead.model_validate(product)
