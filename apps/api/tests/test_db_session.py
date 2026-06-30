from app.db.session import create_db_engine
from app.db.base import Base


def test_create_db_engine_uses_configured_database_url(settings) -> None:
    engine = create_db_engine(settings)

    assert engine.url.render_as_string(hide_password=False) == settings.database_url


def test_base_metadata_starts_empty() -> None:
    assert "coffees" in Base.metadata.tables
