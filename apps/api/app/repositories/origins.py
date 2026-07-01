from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.farm import Farm
from app.models.producer import Producer


def _normalize_search(value: str | None) -> str | None:
    return value.lower().strip() if value else None


def _producer_search_clause(query: str):
    farm_search = (
        select(1)
        .where(
            Farm.producer_id == Producer.id,
            or_(
                func.lower(Farm.name).like(query),
                func.lower(Farm.slug).like(query),
                func.lower(Farm.state).like(query),
                func.lower(Farm.municipality).like(query),
                func.lower(Farm.description).like(query),
            ),
        )
        .exists()
    )
    return or_(
        func.lower(Producer.name).like(query),
        func.lower(Producer.slug).like(query),
        func.lower(Producer.family).like(query),
        func.lower(Producer.description).like(query),
        farm_search,
    )


def _farm_search_clause(query: str):
    producer_search = (
        select(1)
        .where(
            Producer.id == Farm.producer_id,
            or_(
                func.lower(Producer.name).like(query),
                func.lower(Producer.slug).like(query),
                func.lower(Producer.family).like(query),
                func.lower(Producer.description).like(query),
            ),
        )
        .exists()
    )
    return or_(
        func.lower(Farm.name).like(query),
        func.lower(Farm.slug).like(query),
        func.lower(Farm.state).like(query),
        func.lower(Farm.municipality).like(query),
        func.lower(Farm.description).like(query),
        producer_search,
    )


def list_producers(session: Session, q: str | None = None) -> list[Producer]:
    statement = select(Producer).options(selectinload(Producer.farms))
    search = _normalize_search(q)
    if search:
        statement = statement.where(_producer_search_clause(f"%{search}%"))
    statement = statement.order_by(Producer.name.asc())
    return list(session.scalars(statement))


def get_producer_by_slug(session: Session, slug: str) -> Producer | None:
    statement = select(Producer).options(selectinload(Producer.farms)).where(Producer.slug == slug)
    return session.scalar(statement)


def list_farms(session: Session, q: str | None = None) -> list[Farm]:
    statement = select(Farm).options(selectinload(Farm.producer))
    search = _normalize_search(q)
    if search:
        statement = statement.where(_farm_search_clause(f"%{search}%"))
    statement = statement.order_by(Farm.state.asc(), Farm.name.asc())
    return list(session.scalars(statement))


def get_farm_by_slug(session: Session, slug: str) -> Farm | None:
    statement = select(Farm).options(selectinload(Farm.producer)).where(Farm.slug == slug)
    return session.scalar(statement)
