from app.db.session import create_db_engine
from app.db.session import get_db_session
from app.db.base import Base


def test_create_db_engine_uses_configured_database_url(settings) -> None:
    engine = create_db_engine(settings)

    assert engine.url.render_as_string(hide_password=False) == settings.database_url


def test_postgres_engine_uses_bounded_pool(settings) -> None:
    engine = create_db_engine(settings)

    assert engine.pool.size() == 5
    assert engine.pool._max_overflow == 0


def test_base_metadata_starts_empty() -> None:
    assert "coffees" in Base.metadata.tables


def test_get_db_session_is_a_generator_dependency() -> None:
    dependency = get_db_session()

    assert iter(dependency) is dependency
