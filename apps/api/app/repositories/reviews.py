from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from fastapi import HTTPException, status

from app.models.coffee import Coffee
from app.models.review import Review
from app.schemas.review import ReviewCreate


def list_reviews(session: Session, coffee_id: int) -> list[Review]:
    return list(session.scalars(select(Review).where(Review.coffee_id == coffee_id, Review.status == "published").order_by(Review.created_at.desc(), Review.id.desc())))


def list_all_reviews(session: Session) -> list[Review]:
    return list(session.scalars(select(Review).order_by(Review.created_at.desc(), Review.id.desc())))


def moderate_review(session: Session, review_id: int, next_status: str) -> Review:
    review = session.get(Review, review_id)
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    review.status = next_status
    session.commit()
    session.refresh(review)
    return review


def create_review(session: Session, coffee_id: int, user_id: str, payload: ReviewCreate) -> Review:
    if session.scalar(select(Coffee.id).where(Coffee.id == coffee_id)) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coffee not found")
    review = Review(coffee_id=coffee_id, user_id=user_id, rating=payload.rating, title=payload.title.strip(), body=payload.body.strip())
    if not review.title or not review.body:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Review title and body are required")
    session.add(review)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already reviewed this coffee") from None
    session.refresh(review)
    return review
