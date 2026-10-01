from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.address import Address
from app.schemas.address import AddressPayload


def list_addresses(session: Session, user_id: str) -> list[Address]:
    statement = select(Address).where(Address.user_id == user_id).order_by(Address.created_at.asc(), Address.id.asc())
    return list(session.scalars(statement).all())


def get_address(session: Session, address_id: int, user_id: str) -> Address:
    address = session.scalar(select(Address).where(Address.id == address_id, Address.user_id == user_id))
    if address is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    return address


def _clean_payload(payload: AddressPayload) -> dict[str, str | None]:
    values = payload.model_dump()
    return {key: value.strip() if isinstance(value, str) else value for key, value in values.items()}


def create_address(session: Session, user_id: str, payload: AddressPayload) -> Address:
    values = _clean_payload(payload)
    values["country_code"] = str(values["country_code"]).upper()
    address = Address(user_id=user_id, **values)
    session.add(address)
    session.commit()
    session.refresh(address)
    return address


def update_address(session: Session, address_id: int, user_id: str, payload: AddressPayload) -> Address:
    address = get_address(session, address_id, user_id)
    values = _clean_payload(payload)
    values["country_code"] = str(values["country_code"]).upper()
    for key, value in values.items():
        setattr(address, key, value)
    address.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(address)
    return address


def delete_address(session: Session, address_id: int, user_id: str) -> None:
    address = get_address(session, address_id, user_id)
    session.delete(address)
    session.commit()
