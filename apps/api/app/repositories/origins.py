from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.farm import Farm
from app.models.producer import Producer


def list_producers(session: Session) -> list[Producer]:
    statement = select(Producer).options(selectinload(Producer.farms)).order_by(Producer.name.asc())
    return list(session.scalars(statement))


def get_producer_by_slug(session: Session, slug: str) -> Producer | None:
    statement = select(Producer).options(selectinload(Producer.farms)).where(Producer.slug == slug)
    return session.scalar(statement)


def list_farms(session: Session) -> list[Farm]:
    statement = (
        select(Farm)
        .options(selectinload(Farm.producer))
        .order_by(Farm.state.asc(), Farm.name.asc())
    )
    return list(session.scalars(statement))


def get_farm_by_slug(session: Session, slug: str) -> Farm | None:
    statement = select(Farm).options(selectinload(Farm.producer)).where(Farm.slug == slug)
    return session.scalar(statement)
