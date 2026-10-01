import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.repositories.addresses import create_address, delete_address, get_address, update_address
from app.schemas.address import AddressPayload


def payload(label: str = "Home", country_code: str = "us") -> AddressPayload:
    return AddressPayload(
        label=label,
        recipient_name="Alicia Rivera",
        address_line1="123 Main Street",
        city="Austin",
        region="TX",
        postal_code="78701",
        country_code=country_code,
    )


def test_address_crud_normalizes_country_and_scopes_owner() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        address = create_address(session, "user-1", payload())
        assert address.country_code == "US"
        updated = update_address(session, address.id, "user-1", payload("Office"))
        assert updated.label == "Office"
        delete_address(session, address.id, "user-1")

        with pytest.raises(HTTPException) as missing:
            get_address(session, address.id, "user-1")
        with pytest.raises(HTTPException) as forbidden:
            get_address(session, address.id, "user-2")

    assert missing.value.status_code == 404
    assert forbidden.value.status_code == 404
