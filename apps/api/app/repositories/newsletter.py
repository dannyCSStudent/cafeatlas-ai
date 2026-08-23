from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.newsletter import NewsletterSubscriber


def get_newsletter_subscriber_by_email(session: Session, email: str) -> NewsletterSubscriber | None:
    statement = select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)
    return session.scalar(statement)


def subscribe_newsletter(session: Session, email: str) -> tuple[NewsletterSubscriber, bool]:
    normalized_email = email.strip().lower()
    existing = get_newsletter_subscriber_by_email(session, normalized_email)
    if existing is not None:
        return existing, False

    subscriber = NewsletterSubscriber(email=normalized_email)
    session.add(subscriber)
    session.commit()
    session.refresh(subscriber)
    return subscriber, True
