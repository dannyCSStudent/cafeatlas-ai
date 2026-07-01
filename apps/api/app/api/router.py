from fastapi import APIRouter

from app.api.v1.coffees import router as coffees_router
from app.api.v1.origins import router as origins_router
from app.api.v1.health import router as health_router
from app.api.v1.version import router as version_router

api_router = APIRouter()
api_router.include_router(coffees_router)
api_router.include_router(origins_router)
api_router.include_router(health_router)
api_router.include_router(version_router)
