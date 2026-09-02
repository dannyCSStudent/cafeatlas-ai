from datetime import datetime, timezone, timedelta

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.api.v1.events import event_detail, event_rsvp, events
from app.db.base import Base
from app.models.coffee import Coffee
from app.models.event import EventSession
from app.models.farm import Farm
from app.models.producer import Producer
from app.schemas.event import EventRSVPCreate


def _seed_origin_data(session: Session):
    producer = Producer(
        name="Finca La Esperanza",
        slug="finca-la-esperanza",
        family="Hernandez",
        description="Family producer from Chiapas.",
    )
    farm = Farm(
        producer=producer,
        name="Finca La Esperanza",
        slug="finca-la-esperanza",
        state="Chiapas",
        municipality="San Cristobal de las Casas",
        altitude_meters=1650,
        description="Shade-grown highland farm.",
    )
    coffee = Coffee(
        producer=producer,
        farm=farm,
        name="Sierra Negra",
        slug="sierra-negra",
        origin_state="Chiapas",
        producer_name="Finca La Esperanza",
        process="Washed",
        varietal="Bourbon, Typica",
        tasting_notes="Jasmine, orange peel, and honey",
        image_url="data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
        description="Bright and floral.",
        price_cents=2400,
        is_featured=True,
    )
    session.add_all([producer, farm, coffee])
    session.flush()
    return producer, farm, coffee


def test_events_route_returns_upcoming_events(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        producer, farm, coffee = _seed_origin_data(session)
        session.add_all(
            [
                EventSession(
                    slug="seasonal-tasting-circle",
                    title="Seasonal tasting circle",
                    category="Coffee tasting",
                    summary="Compare two origin stories side by side.",
                    starts_at=datetime.now(timezone.utc) + timedelta(days=2),
                    duration_minutes=75,
                    host_name="CafeAtlas editorial team",
                    audience="For curious tasters",
                    is_featured=True,
                    coffee=coffee,
                    producer=producer,
                    farm=farm,
                ),
                EventSession(
                    slug="producer-conversation",
                    title="Producer conversation",
                    category="Producer livestream",
                    summary="Live producer Q&A.",
                    starts_at=datetime.now(timezone.utc) + timedelta(days=4),
                    duration_minutes=60,
                    host_name=producer.name,
                    audience="For member Q&A",
                    producer=producer,
                    farm=farm,
                ),
            ]
        )
        session.commit()

        response = events(session=session)

    assert len(response) == 2
    assert response[0].slug == "seasonal-tasting-circle"
    assert response[0].coffee is not None
    assert response[0].producer is not None
    assert response[0].farm is not None
    assert response[0].rsvp_count == 0


def test_events_route_can_filter_by_category(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        _, _, coffee = _seed_origin_data(session)
        session.add_all(
            [
                EventSession(
                    slug="seasonal-tasting-circle",
                    title="Seasonal tasting circle",
                    category="Coffee tasting",
                    summary="Compare two origin stories side by side.",
                    starts_at=datetime.now(timezone.utc) + timedelta(days=2),
                    duration_minutes=75,
                    host_name="CafeAtlas editorial team",
                    audience="For curious tasters",
                    coffee=coffee,
                ),
                EventSession(
                    slug="origin-walkthrough",
                    title="Origin walk-through",
                    category="Virtual tour",
                    summary="Follow a farm from drying patio to finished lot.",
                    starts_at=datetime.now(timezone.utc) + timedelta(days=3),
                    duration_minutes=45,
                    host_name="CafeAtlas editorial team",
                    audience="For origin-first readers",
                ),
            ]
        )
        session.commit()

        response = events(category="Virtual tour", session=session)

    assert [event.slug for event in response] == ["origin-walkthrough"]


def test_event_detail_returns_404_for_missing_event(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        with pytest.raises(HTTPException) as exc_info:
            event_detail("missing", session)

    assert exc_info.value.status_code == 404


def test_event_rsvp_is_idempotent(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        _, _, coffee = _seed_origin_data(session)
        event = EventSession(
            slug="seasonal-tasting-circle",
            title="Seasonal tasting circle",
            category="Coffee tasting",
            summary="Compare two origin stories side by side.",
            starts_at=datetime.now(timezone.utc) + timedelta(days=2),
            duration_minutes=75,
            host_name="CafeAtlas editorial team",
            audience="For curious tasters",
            coffee=coffee,
        )
        session.add(event)
        session.commit()

        first = event_rsvp(
            "seasonal-tasting-circle",
            EventRSVPCreate(
                attendee_name="Alicia",
                attendee_email="alicia@example.com",
                note="Please send the tasting link.",
            ),
            session,
        )
        second = event_rsvp(
            "seasonal-tasting-circle",
            EventRSVPCreate(
                attendee_name="Alicia",
                attendee_email="alicia@example.com",
                note="Please send the tasting link.",
            ),
            session,
        )

    assert first.id == second.id
    assert first.attendee_email == "alicia@example.com"
