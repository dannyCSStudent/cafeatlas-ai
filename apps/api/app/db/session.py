from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.settings import Settings, get_settings


def create_db_engine(settings: Settings | None = None) -> Engine:
    settings = settings or get_settings()

    if not settings.database_url:
        raise RuntimeError("CAFEATLAS_DATABASE_URL is not configured")

    return create_engine(settings.database_url, pool_pre_ping=True)


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    return create_db_engine()


def create_session_factory(settings: Settings | None = None) -> sessionmaker[Session]:
    return sessionmaker(
        bind=create_db_engine(settings),
        autoflush=False,
        autocommit=False,
    )


def get_db_session() -> Session:
    return create_session_factory()()
