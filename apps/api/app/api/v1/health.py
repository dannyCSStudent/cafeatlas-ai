import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.engine import make_url

from app.db.session import create_db_engine
from app.core.settings import Settings, get_settings

router = APIRouter(tags=["health"])
logger = logging.getLogger(__name__)


@router.get("/health")
def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.environment,
        "version": settings.app_version,
    }


@router.get("/health/ready")
def readiness(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    try:
        with create_db_engine(settings).connect() as connection:
            connection.execute(text("SELECT 1"))
    except (SQLAlchemyError, RuntimeError) as error:
        target = "unconfigured"
        if settings.database_url:
            database_url = make_url(settings.database_url)
            target = f"{database_url.drivername}://{database_url.host}:{database_url.port}/{database_url.database}"
        logger.error("Database readiness check failed for %s: %s", target, type(error).__name__)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable.",
        ) from None

    return {
        "status": "ready",
        "service": settings.app_name,
        "environment": settings.environment,
        "version": settings.app_version,
    }
