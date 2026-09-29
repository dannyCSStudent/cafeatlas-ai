from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session

from app.core.settings import Settings, get_settings
from app.core.stripe import verify_webhook_signature
from app.db.session import get_db_session
from app.repositories.orders import complete_order_from_stripe

router = APIRouter(tags=["webhooks"])


@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str | None = Header(default=None, alias="Stripe-Signature"),
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> dict[str, bool]:
    if not settings.stripe_webhook_secret:
        return {"received": False}

    event = verify_webhook_signature(await request.body(), stripe_signature, settings.stripe_webhook_secret.get_secret_value())
    event_type = event.get("type")
    event_object = event.get("data", {}).get("object", {})
    session_id = event_object.get("id") if isinstance(event_object, dict) else None
    if isinstance(session_id, str) and event_type in {"checkout.session.completed", "checkout.session.expired"}:
        complete_order_from_stripe(session, session_id, event_type == "checkout.session.completed")
    return {"received": True}
