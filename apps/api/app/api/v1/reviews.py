from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.db.session import get_db_session
from app.repositories.reviews import create_review, list_reviews
from app.schemas.review import ReviewCreate, ReviewRead

router = APIRouter(tags=["reviews"])


@router.get("/coffees/{coffee_id}/reviews", response_model=list[ReviewRead])
def reviews(coffee_id: int, session: Session = Depends(get_db_session)) -> list[ReviewRead]:
    return [ReviewRead.model_validate(review) for review in list_reviews(session, coffee_id)]


@router.post("/coffees/{coffee_id}/reviews", response_model=ReviewRead, status_code=201)
def add_review(
    coffee_id: int,
    payload: ReviewCreate,
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> ReviewRead:
    return ReviewRead.model_validate(create_review(session, coffee_id, user_id, payload))
