from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.coffee import Coffee


def list_coffees(session: Session) -> list[Coffee]:
    statement = select(Coffee).order_by(Coffee.created_at.desc(), Coffee.id.desc())
    return list(session.scalars(statement))

