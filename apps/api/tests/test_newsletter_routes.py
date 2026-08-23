from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.api.v1.newsletter import subscribe
from app.db.base import Base
from app.models.newsletter import NewsletterSubscriber
from app.schemas.newsletter import NewsletterSubscribeRequest


def test_newsletter_subscribe_route_creates_subscriber(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        response = subscribe(NewsletterSubscribeRequest(email="Reader@Example.com"), session)

    assert response.email == "reader@example.com"
    assert response.subscribed is True


def test_newsletter_subscribe_route_returns_existing_subscriber(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add(NewsletterSubscriber(email="reader@example.com"))
        session.commit()

        response = subscribe(NewsletterSubscribeRequest(email="Reader@Example.com"), session)

    assert response.email == "reader@example.com"
    assert response.subscribed is False
