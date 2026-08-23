from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.newsletter import NewsletterSubscriber
from app.repositories.newsletter import subscribe_newsletter


def test_subscribe_newsletter_creates_new_subscriber() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        subscriber, created = subscribe_newsletter(session, "Reader@Example.com")

    assert created is True
    assert subscriber.email == "reader@example.com"


def test_subscribe_newsletter_returns_existing_subscriber() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add(NewsletterSubscriber(email="reader@example.com"))
        session.commit()

        subscriber, created = subscribe_newsletter(session, "Reader@Example.com")

    assert created is False
    assert subscriber.email == "reader@example.com"
