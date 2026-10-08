from functools import lru_cache
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.settings import Settings, get_settings


def create_db_engine(settings: Settings | None = None) -> Engine:
    settings = settings or get_settings()

    if not settings.database_url:
        raise RuntimeError("CAFEATLAS_DATABASE_URL is not configured")

    engine_options: dict[str, object] = {"pool_pre_ping": True}
    if settings.database_url.startswith(("postgresql://", "postgres://")):
        engine_options.update(
            pool_size=5,
            max_overflow=0,
            pool_timeout=10,
            pool_recycle=1800,
        )

    return create_engine(settings.database_url, **engine_options)


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    return create_db_engine()


def create_session_factory(settings: Settings | None = None) -> sessionmaker[Session]:
    return sessionmaker(
        bind=create_db_engine(settings),
        autoflush=False,
        autocommit=False,
    )


@lru_cache(maxsize=1)
def get_session_factory() -> sessionmaker[Session]:
    return sessionmaker(
        bind=get_engine(),
        autoflush=False,
        autocommit=False,
    )


def get_db_session() -> Iterator[Session]:
    with get_session_factory()() as session:
        yield session
