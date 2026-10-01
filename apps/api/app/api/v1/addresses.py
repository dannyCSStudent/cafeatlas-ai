from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.db.session import get_db_session
from app.repositories.addresses import create_address, delete_address, get_address, list_addresses, update_address
from app.schemas.address import AddressPayload, AddressRead

router = APIRouter(tags=["addresses"])


@router.get("/addresses", response_model=list[AddressRead])
def addresses(session: Session = Depends(get_db_session), user_id: str = Depends(get_current_user_id)) -> list[AddressRead]:
    return [AddressRead.model_validate(item) for item in list_addresses(session, user_id)]


@router.post("/addresses", response_model=AddressRead, status_code=status.HTTP_201_CREATED)
def add_address(payload: AddressPayload, session: Session = Depends(get_db_session), user_id: str = Depends(get_current_user_id)) -> AddressRead:
    return AddressRead.model_validate(create_address(session, user_id, payload))


@router.patch("/addresses/{address_id}", response_model=AddressRead)
def edit_address(address_id: int, payload: AddressPayload, session: Session = Depends(get_db_session), user_id: str = Depends(get_current_user_id)) -> AddressRead:
    return AddressRead.model_validate(update_address(session, address_id, user_id, payload))


@router.delete("/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_address(address_id: int, session: Session = Depends(get_db_session), user_id: str = Depends(get_current_user_id)) -> Response:
    delete_address(session, address_id, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
