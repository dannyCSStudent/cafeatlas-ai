from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.repositories.newsletter import subscribe_newsletter
from app.schemas.newsletter import NewsletterSubscribeRequest, NewsletterSubscribeResponse

router = APIRouter(tags=["newsletter"])


@router.post("/newsletter/subscribe", response_model=NewsletterSubscribeResponse)
def subscribe(payload: NewsletterSubscribeRequest, session: Session = Depends(get_db_session)):
    subscriber, created = subscribe_newsletter(session, payload.email)
    return NewsletterSubscribeResponse(
        email=subscriber.email,
        subscribed=created,
        created_at=subscriber.created_at,
    )
