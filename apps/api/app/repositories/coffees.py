from sqlalchemy import func, select
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload

from app.models.coffee import Coffee
from app.models.producer import Producer
from app.schemas.coffee import CoffeeCreate

CoffeeSort = str


def _apply_coffee_filters(
    statement,
    *,
    state: str | None = None,
    producer_slug: str | None = None,
    featured: bool | None = None,
):
    if state:
        statement = statement.where(Coffee.origin_state == state)
    if featured is not None:
        statement = statement.where(Coffee.is_featured.is_(featured))
    if producer_slug:
        statement = statement.join(Producer, Coffee.producer_id == Producer.id).where(Producer.slug == producer_slug)
    return statement


def _apply_coffee_ordering(statement, sort: CoffeeSort):
    if sort == "oldest":
        return statement.order_by(Coffee.created_at.asc(), Coffee.id.asc())
    if sort == "price_asc":
        return statement.order_by(Coffee.price_cents.asc(), Coffee.created_at.desc(), Coffee.id.desc())
    if sort == "price_desc":
        return statement.order_by(Coffee.price_cents.desc(), Coffee.created_at.desc(), Coffee.id.desc())
    if sort == "featured":
        return statement.order_by(Coffee.is_featured.desc(), Coffee.created_at.desc(), Coffee.id.desc())
    return statement.order_by(Coffee.created_at.desc(), Coffee.id.desc())


def list_coffees(
    session: Session,
    *,
    state: str | None = None,
    producer_slug: str | None = None,
    featured: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    sort: CoffeeSort = "newest",
) -> list[Coffee]:
    statement = _apply_coffee_filters(
        select(Coffee).options(selectinload(Coffee.producer), selectinload(Coffee.farm)),
        state=state,
        producer_slug=producer_slug,
        featured=featured,
    )
    statement = _apply_coffee_ordering(statement, sort)
    statement = statement.offset((page - 1) * page_size).limit(page_size)
    return list(session.scalars(statement))


def count_coffees(
    session: Session,
    *,
    state: str | None = None,
    producer_slug: str | None = None,
    featured: bool | None = None,
) -> int:
    statement = _apply_coffee_filters(
        select(func.count(Coffee.id)),
        state=state,
        producer_slug=producer_slug,
        featured=featured,
    )
    return int(session.scalar(statement) or 0)


def get_coffee_by_slug(session: Session, slug: str) -> Coffee | None:
    statement = (
        select(Coffee)
        .options(selectinload(Coffee.producer), selectinload(Coffee.farm))
        .where(Coffee.slug == slug)
    )
    return session.scalar(statement)


def create_coffee(session: Session, coffee_data: CoffeeCreate) -> Coffee:
    coffee = Coffee(**coffee_data.model_dump())
    session.add(coffee)
    session.commit()
    session.refresh(coffee)
    return coffee
