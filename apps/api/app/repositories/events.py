from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.coffee import Coffee
from app.models.event import EventRSVP, EventSession
from app.models.farm import Farm
from app.models.producer import Producer
from app.schemas.event import EventRSVPCreate


def _apply_event_filters(
    statement,
    *,
    q: str | None = None,
    category: str | None = None,
    upcoming_only: bool = True,
):
    if q:
        search = f"%{q.lower()}%"
        statement = statement.outerjoin(Coffee, EventSession.coffee_id == Coffee.id).outerjoin(
            Producer, EventSession.producer_id == Producer.id
        ).outerjoin(Farm, EventSession.farm_id == Farm.id)
        statement = statement.where(
            or_(
                func.lower(EventSession.title).like(search),
                func.lower(EventSession.slug).like(search),
                func.lower(EventSession.category).like(search),
                func.lower(EventSession.summary).like(search),
                func.lower(EventSession.host_name).like(search),
                func.lower(Coffee.name).like(search),
                func.lower(Coffee.slug).like(search),
                func.lower(Producer.name).like(search),
                func.lower(Producer.slug).like(search),
                func.lower(Farm.name).like(search),
                func.lower(Farm.slug).like(search),
            )
        )
    if category:
        statement = statement.where(EventSession.category == category)
    if upcoming_only:
        statement = statement.where(EventSession.starts_at >= datetime.now(timezone.utc))
    return statement


def _event_base_statement():
    return select(EventSession).options(
        selectinload(EventSession.coffee),
        selectinload(EventSession.producer),
        selectinload(EventSession.farm),
        selectinload(EventSession.rsvps),
    )


def list_events(
    session: Session,
    *,
    q: str | None = None,
    category: str | None = None,
    upcoming_only: bool = True,
) -> list[EventSession]:
    statement = _apply_event_filters(
        _event_base_statement(),
        q=q,
        category=category,
        upcoming_only=upcoming_only,
    )
    statement = statement.order_by(EventSession.starts_at.asc(), EventSession.id.asc())
    return list(session.scalars(statement))


def get_event_by_slug(session: Session, slug: str) -> EventSession | None:
    statement = _event_base_statement().where(EventSession.slug == slug)
    return session.scalar(statement)


def get_event_rsvp_by_email(session: Session, *, event_session_id: int, attendee_email: str) -> EventRSVP | None:
    statement = select(EventRSVP).where(
        EventRSVP.event_session_id == event_session_id,
        func.lower(EventRSVP.attendee_email) == attendee_email.lower(),
    )
    return session.scalar(statement)


def create_event_rsvp(session: Session, event_session: EventSession, rsvp_data: EventRSVPCreate) -> EventRSVP:
    existing = get_event_rsvp_by_email(
        session,
        event_session_id=event_session.id,
        attendee_email=rsvp_data.attendee_email,
    )
    if existing is not None:
        return existing

    rsvp = EventRSVP(event_session=event_session, **rsvp_data.model_dump())
    session.add(rsvp)
    session.commit()
    session.refresh(rsvp)
    return rsvp
