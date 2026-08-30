from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.coffee import Coffee
from app.models.farm import Farm
from app.models.state import State


def _normalize_search(value: str | None) -> str | None:
    return value.lower().strip() if value else None


def _state_count_statement():
    farm_counts = (
        select(
            Farm.state_id.label("state_id"),
            func.count(Farm.id).label("farm_count"),
        )
        .where(Farm.state_id.is_not(None))
        .group_by(Farm.state_id)
        .subquery()
    )
    coffee_counts = (
        select(
            Coffee.origin_state_id.label("state_id"),
            func.count(Coffee.id).label("coffee_count"),
        )
        .where(Coffee.origin_state_id.is_not(None))
        .group_by(Coffee.origin_state_id)
        .subquery()
    )

    return (
        select(
            State,
            func.coalesce(farm_counts.c.farm_count, 0),
            func.coalesce(coffee_counts.c.coffee_count, 0),
        )
        .outerjoin(farm_counts, farm_counts.c.state_id == State.id)
        .outerjoin(coffee_counts, coffee_counts.c.state_id == State.id)
    )


def list_states(session: Session, q: str | None = None) -> list[tuple[State, int, int]]:
    statement = _state_count_statement()
    search = _normalize_search(q)
    if search:
        statement = statement.where(
            or_(
                func.lower(State.name).like(f"%{search}%"),
                func.lower(State.slug).like(f"%{search}%"),
            )
        )
    statement = statement.order_by(State.name.asc())
    return [(state, int(farm_count), int(coffee_count)) for state, farm_count, coffee_count in session.execute(statement)]


def get_state_by_slug(session: Session, slug: str) -> tuple[State, int, int] | None:
    statement = _state_count_statement().where(State.slug == slug)
    row = session.execute(statement).one_or_none()
    if row is None:
        return None
    state, farm_count, coffee_count = row
    return state, int(farm_count), int(coffee_count)
