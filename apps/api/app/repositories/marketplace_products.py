from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.marketplace_product import MarketplaceProduct


ALLOWED_MARKETPLACE_SORTS = {"newest", "oldest", "price_asc", "price_desc", "featured"}


def list_marketplace_products(
    session: Session,
    *,
    q: str | None = None,
    category: str | None = None,
    page: int = 1,
    page_size: int = 20,
    sort: str = "newest",
) -> list[MarketplaceProduct]:
    statement = select(MarketplaceProduct)
    if q:
        search = f"%{q.strip()}%"
        statement = statement.where(or_(MarketplaceProduct.name.ilike(search), MarketplaceProduct.description.ilike(search)))
    if category:
        statement = statement.where(MarketplaceProduct.category == category)
    if sort == "oldest":
        statement = statement.order_by(MarketplaceProduct.created_at.asc(), MarketplaceProduct.id.asc())
    elif sort == "price_asc":
        statement = statement.order_by(MarketplaceProduct.price_cents.asc(), MarketplaceProduct.id.asc())
    elif sort == "price_desc":
        statement = statement.order_by(MarketplaceProduct.price_cents.desc(), MarketplaceProduct.id.desc())
    elif sort == "featured":
        statement = statement.order_by(MarketplaceProduct.is_featured.desc(), MarketplaceProduct.created_at.desc(), MarketplaceProduct.id.desc())
    else:
        statement = statement.order_by(MarketplaceProduct.created_at.desc(), MarketplaceProduct.id.desc())
    return list(session.scalars(statement.offset((page - 1) * page_size).limit(page_size)))


def count_marketplace_products(session: Session, *, q: str | None = None, category: str | None = None) -> int:
    statement = select(func.count(MarketplaceProduct.id))
    if q:
        search = f"%{q.strip()}%"
        statement = statement.where(or_(MarketplaceProduct.name.ilike(search), MarketplaceProduct.description.ilike(search)))
    if category:
        statement = statement.where(MarketplaceProduct.category == category)
    return int(session.scalar(statement) or 0)


def get_marketplace_product_by_slug(session: Session, slug: str) -> MarketplaceProduct | None:
    return session.scalar(select(MarketplaceProduct).where(MarketplaceProduct.slug == slug))
