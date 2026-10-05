from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.settings import Settings, get_settings
from app.core import stripe as stripe_client
from app.core.stripe import verify_webhook_signature
from app.db.session import get_db_session
from app.repositories.orders import complete_order_from_stripe
from app.repositories.notifications import create_order_notification
from app.repositories.subscriptions import update_subscription_from_stripe, upsert_subscription
from app.models.wholesale_request import WholesaleRequest

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
        order = complete_order_from_stripe(session, session_id, event_type == "checkout.session.completed")
        expected_status = "paid" if event_type == "checkout.session.completed" else "cancelled"
        if order is not None and order.status == expected_status:
            create_order_notification(session, order.user_id, order.id, event_type == "checkout.session.completed")
    if event_type in {"checkout.session.completed", "checkout.session.expired"}:
        metadata = event_object.get("metadata") if isinstance(event_object.get("metadata"), dict) else {}
        wholesale_request_id = metadata.get("wholesale_request_id")
        if isinstance(wholesale_request_id, str) and wholesale_request_id.isdigit():
            wholesale_request = session.scalar(select(WholesaleRequest).where(WholesaleRequest.id == int(wholesale_request_id)))
            if wholesale_request is not None and wholesale_request.stripe_session_id == session_id:
                if event_type == "checkout.session.completed":
                    wholesale_request.status = "paid"
                    wholesale_request.paid_at = datetime.now(timezone.utc)
                    invoice_id = event_object.get("invoice")
                    if isinstance(invoice_id, str) and invoice_id:
                        wholesale_request.stripe_invoice_id = invoice_id
                        invoice = stripe_client.retrieve_invoice(settings, invoice_id)
                        invoice_url = invoice.get("hosted_invoice_url") if invoice else None
                        if isinstance(invoice_url, str):
                            wholesale_request.invoice_url = invoice_url
                elif wholesale_request.status == "payment_pending":
                    wholesale_request.status = "approved"
                session.commit()
    if event_type == "checkout.session.completed" and event_object.get("mode") == "subscription":
        metadata = event_object.get("metadata") if isinstance(event_object.get("metadata"), dict) else {}
        subscription_id = event_object.get("subscription")
        user_id = metadata.get("user_id")
        plan = metadata.get("plan")
        price_id = metadata.get("price_id")
        if all(isinstance(value, str) and value for value in (subscription_id, user_id, plan, price_id)):
            upsert_subscription(
                session,
                user_id=user_id,
                plan=plan,
                status="active",
                stripe_subscription_id=subscription_id,
                price_id=price_id,
                stripe_customer_id=event_object.get("customer"),
            )
    if event_type in {"customer.subscription.updated", "customer.subscription.deleted"}:
        metadata = event_object.get("metadata") if isinstance(event_object.get("metadata"), dict) else {}
        items = event_object.get("items", {}).get("data", []) if isinstance(event_object.get("items"), dict) else []
        first_item = items[0] if items and isinstance(items[0], dict) else {}
        price = first_item.get("price", {}) if isinstance(first_item.get("price"), dict) else {}
        period_end = event_object.get("current_period_end")
        current_period_end = datetime.fromtimestamp(period_end, tz=timezone.utc) if isinstance(period_end, (int, float)) else None
        update_subscription_from_stripe(
            session,
            stripe_subscription_id=event_object.get("id", ""),
            status="canceled" if event_type.endswith("deleted") else str(event_object.get("status", "unknown")),
            price_id=str(price.get("id") or metadata.get("price_id") or "unknown"),
            stripe_customer_id=event_object.get("customer"),
            current_period_end=current_period_end,
            cancel_at_period_end=bool(event_object.get("cancel_at_period_end", False)),
        )
    return {"received": True}
