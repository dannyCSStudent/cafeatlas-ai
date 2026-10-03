from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.db.session import get_db_session
from app.models.gift_request import GiftRequest
from app.schemas.gift_request import GiftRequestCreate, GiftRequestRead

router = APIRouter(tags=["gift-requests"])


@router.get("/gift-requests", response_model=list[GiftRequestRead])
def gift_requests(session: Session = Depends(get_db_session), user_id: str = Depends(get_current_user_id)) -> list[GiftRequestRead]:
    items = session.scalars(select(GiftRequest).where(GiftRequest.user_id == user_id).order_by(GiftRequest.created_at.desc())).all()
    return [GiftRequestRead.model_validate(item) for item in items]


@router.post("/gift-requests", response_model=GiftRequestRead, status_code=status.HTTP_201_CREATED)
def create_gift_request(payload: GiftRequestCreate, session: Session = Depends(get_db_session), user_id: str = Depends(get_current_user_id)) -> GiftRequestRead:
    request = GiftRequest(user_id=user_id, box_name=payload.box_name.strip(), quantity=payload.quantity, delivery_country=payload.delivery_country.upper(), note=payload.note.strip())
    session.add(request)
    session.commit()
    session.refresh(request)
    return GiftRequestRead.model_validate(request)
