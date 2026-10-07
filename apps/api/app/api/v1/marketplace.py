from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.repositories.marketplace_products import (
    ALLOWED_MARKETPLACE_SORTS,
    count_marketplace_products,
    get_marketplace_product_by_slug,
    list_marketplace_products,
)
from app.schemas.marketplace_product import MARKETPLACE_CATEGORIES, MarketplaceProductListPage, MarketplaceProductRead


router = APIRouter(prefix="/marketplace/products", tags=["marketplace"])


@router.get("", response_model=MarketplaceProductListPage)
def marketplace_products(
    session: Session = Depends(get_db_session),
    q: str | None = None,
    category: str | None = Query(default=None),
    page: int = 1,
    page_size: int = 20,
    sort: str = "newest",
) -> MarketplaceProductListPage:
    if page < 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="page must be greater than 0")
    if page_size < 1 or page_size > 100:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="page_size must be between 1 and 100")
    if sort not in ALLOWED_MARKETPLACE_SORTS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid marketplace sort")
    if category and category not in MARKETPLACE_CATEGORIES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid marketplace category")

    items = list_marketplace_products(session, q=q, category=category, page=page, page_size=page_size, sort=sort)
    total = count_marketplace_products(session, q=q, category=category)
    total_pages = (total + page_size - 1) // page_size if total else 0
    return MarketplaceProductListPage(
        items=[MarketplaceProductRead.model_validate(item) for item in items],
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1,
    )


@router.get("/{slug}", response_model=MarketplaceProductRead)
def marketplace_product(slug: str, session: Session = Depends(get_db_session)) -> MarketplaceProductRead:
    product = get_marketplace_product_by_slug(session, slug)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marketplace product not found")
    return MarketplaceProductRead.model_validate(product)
