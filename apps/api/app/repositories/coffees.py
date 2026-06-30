from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.coffee import Coffee
from app.schemas.coffee import CoffeeCreate


def list_coffees(session: Session) -> list[Coffee]:
    statement = select(Coffee).order_by(Coffee.created_at.desc(), Coffee.id.desc())
    return list(session.scalars(statement))


def get_coffee_by_slug(session: Session, slug: str) -> Coffee | None:
    statement = select(Coffee).where(Coffee.slug == slug)
    return session.scalar(statement)


def create_coffee(session: Session, coffee_data: CoffeeCreate) -> Coffee:
    coffee = Coffee(**coffee_data.model_dump())
    session.add(coffee)
    session.commit()
    session.refresh(coffee)
    return coffee
