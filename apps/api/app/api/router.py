from fastapi import APIRouter

from app.api.v1.coffees import router as coffees_router
from app.api.v1.addresses import router as addresses_router
from app.api.v1.checkout import router as checkout_router
from app.api.v1.events import router as events_router
from app.api.v1.newsletter import router as newsletter_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.admin_orders import router as admin_orders_router
from app.api.v1.orders import router as orders_router
from app.api.v1.webhooks import router as webhooks_router
from app.api.v1.origins import router as origins_router
from app.api.v1.return_requests import router as return_requests_router
from app.api.v1.wishlist import router as wishlist_router
from app.api.v1.health import router as health_router
from app.api.v1.version import router as version_router
from app.api.v1.states import router as states_router

api_router = APIRouter()
api_router.include_router(coffees_router)
api_router.include_router(addresses_router)
api_router.include_router(checkout_router)
api_router.include_router(events_router)
api_router.include_router(newsletter_router)
api_router.include_router(notifications_router)
api_router.include_router(admin_orders_router)
api_router.include_router(orders_router)
api_router.include_router(webhooks_router)
api_router.include_router(origins_router)
api_router.include_router(return_requests_router)
api_router.include_router(wishlist_router)
api_router.include_router(states_router)
api_router.include_router(health_router)
api_router.include_router(version_router)
