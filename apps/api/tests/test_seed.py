from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.models.coffee import Coffee


def test_seed_coffees_populates_empty_database(monkeypatch) -> None:
    from seed import seed_coffees

    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    monkeypatch.setattr("seed.create_db_engine", lambda settings=None: engine)
    monkeypatch.setattr("seed.create_session_factory", lambda settings=None: SessionLocal)
    monkeypatch.setattr("seed.get_settings", lambda: object())

    created = seed_coffees()

    assert created == 3

    with SessionLocal() as session:
        total = session.scalar(select(func.count()).select_from(Coffee))
        assert total == 3


def test_seed_coffees_is_idempotent(monkeypatch) -> None:
    from seed import seed_coffees

    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    with SessionLocal() as session:
        session.add(
            Coffee(
                producer_id=None,
                farm_id=None,
                name="Existing",
                slug="existing",
                origin_state="Chiapas",
                producer_name="Producer",
                description=None,
                price_cents=1,
                is_featured=False,
            )
        )
        session.commit()

    monkeypatch.setattr("seed.create_db_engine", lambda settings=None: engine)
    monkeypatch.setattr("seed.create_session_factory", lambda settings=None: SessionLocal)
    monkeypatch.setattr("seed.get_settings", lambda: object())

    created = seed_coffees()

    assert created == 0
