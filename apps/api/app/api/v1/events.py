from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.repositories.events import create_event_rsvp, get_event_by_slug, list_events
from app.schemas.event import EventRSVPCreate, EventRSVPRead, EventSessionRead

router = APIRouter(tags=["events"])


@router.get("/events", response_model=list[EventSessionRead])
def events(
    q: str | None = None,
    category: str | None = None,
    upcoming_only: bool = True,
    session: Session = Depends(get_db_session),
) -> list[EventSessionRead]:
    return [
        EventSessionRead.model_validate(event)
        for event in list_events(session, q=q, category=category, upcoming_only=upcoming_only)
    ]


@router.get("/events/{slug}", response_model=EventSessionRead)
def event_detail(
    slug: str,
    session: Session = Depends(get_db_session),
) -> EventSessionRead:
    event = get_event_by_slug(session, slug)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return EventSessionRead.model_validate(event)


@router.post("/events/{slug}/rsvps", response_model=EventRSVPRead, status_code=status.HTTP_201_CREATED)
def event_rsvp(
    slug: str,
    payload: EventRSVPCreate,
    session: Session = Depends(get_db_session),
) -> EventRSVPRead:
    event = get_event_by_slug(session, slug)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return EventRSVPRead.model_validate(create_event_rsvp(session, event, payload))
