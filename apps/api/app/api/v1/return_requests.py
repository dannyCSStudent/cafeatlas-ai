from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.db.session import get_db_session
from app.repositories.return_requests import create_return_request, list_return_requests
from app.schemas.return_request import ReturnRequestCreate, ReturnRequestRead

router = APIRouter(tags=["returns"])


@router.get("/returns", response_model=list[ReturnRequestRead])
def returns(
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> list[ReturnRequestRead]:
    return [ReturnRequestRead.model_validate(item) for item in list_return_requests(session, user_id)]


@router.post("/orders/{order_id}/return", response_model=ReturnRequestRead, status_code=status.HTTP_201_CREATED)
def request_return(
    order_id: int,
    payload: ReturnRequestCreate,
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> ReturnRequestRead:
    return ReturnRequestRead.model_validate(create_return_request(session, order_id, user_id, payload))
