from fastapi import APIRouter, Depends

from app.core.settings import Settings, get_settings

router = APIRouter(tags=["version"])


@router.get("/version")
def version(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {
        "service": settings.app_name,
        "environment": settings.environment,
        "version": settings.app_version,
    }

