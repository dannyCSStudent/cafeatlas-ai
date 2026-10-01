import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.coffee import Coffee
from app.repositories.wishlist import remove_wishlist_item, save_wishlist_item


def test_wishlist_save_is_idempotent_and_user_scoped() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        coffee = Coffee(name="Sierra Negra", slug="sierra-negra", origin_state="Chiapas", producer_name="Finca", price_cents=2400)
        session.add(coffee)
        session.commit()

        first = save_wishlist_item(session, coffee.id, "user-1")
        second = save_wishlist_item(session, coffee.id, "user-1")
        removed = remove_wishlist_item(session, coffee.id, "user-1")

    assert first.id == second.id
    assert removed is True


def test_wishlist_rejects_unknown_coffee() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        with pytest.raises(HTTPException) as error:
            save_wishlist_item(session, 999, "user-1")

    assert error.value.status_code == 404
