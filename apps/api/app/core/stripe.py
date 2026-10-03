import json
import hashlib
import hmac
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import HTTPException, status
from tomlkit import key

from app.core.settings import Settings
from app.models.order import Order


def subscription_price_id(settings: Settings, plan: str) -> str:
    price_ids = {
        "seasonal": settings.stripe_club_seasonal_price_id,
        "origin": settings.stripe_club_origin_price_id,
        "reserve": settings.stripe_club_reserve_price_id,
    }
    price_id = price_ids.get(plan)
    if not price_id:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Club plan is not configured")
    if not price_id.startswith("price_"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Club plan '{plan}' must use a Stripe Price ID beginning with price_, not a Product ID",
        )
    return price_id


def create_subscription_checkout_session(settings: Settings, user_id: str, plan: str, success_url: str, cancel_url: str) -> tuple[str, str]:
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Stripe is not configured")
    fields = [
        ("mode", "subscription"),
        ("success_url", success_url),
        ("cancel_url", cancel_url),
        ("line_items[0][price]", subscription_price_id(settings, plan)),
        ("line_items[0][quantity]", "1"),
        ("metadata[user_id]", user_id),
        ("metadata[plan]", plan),
        ("metadata[price_id]", subscription_price_id(settings, plan)),
        ("subscription_data[metadata][user_id]", user_id),
        ("subscription_data[metadata][plan]", plan),
    ]
    request = Request("https://api.stripe.com/v1/checkout/sessions", data=urlencode(fields).encode(), headers={"Authorization": f"Bearer {settings.stripe_secret_key.get_secret_value()}", "Content-Type": "application/x-www-form-urlencoded"}, method="POST")
    try:
        with urlopen(request, timeout=10) as response:
            payload = json.load(response)
    except HTTPError as error:
        message = "Stripe subscription checkout failed"
        try:
            error_payload = json.loads(error.read().decode("utf-8"))
            stripe_message = error_payload.get("error", {}).get("message")
            if isinstance(stripe_message, str) and stripe_message:
                message = f"Stripe subscription checkout failed: {stripe_message}"
        except (UnicodeDecodeError, json.JSONDecodeError, AttributeError):
            pass
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=message) from None
    except (URLError, TimeoutError, ValueError):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Stripe subscription checkout failed") from None
    session_id = payload.get("id")
    checkout_url = payload.get("url")
    key = settings.stripe_secret_key.get_secret_value()

    print(f"[Stripe] Stripe key fingerprint: {key[:7]}...{key[-4:]}")
    print(f"[Stripe] Created subscription Checkout Session: {session_id}")
    if not isinstance(session_id, str) or not isinstance(checkout_url, str):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Stripe returned an invalid subscription session")
    return session_id, checkout_url


def cancel_subscription_at_period_end(settings: Settings, stripe_subscription_id: str) -> None:
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Stripe is not configured")
    request = Request(
        f"https://api.stripe.com/v1/subscriptions/{stripe_subscription_id}",
        data=urlencode({"cancel_at_period_end": "true"}).encode(),
        headers={"Authorization": f"Bearer {settings.stripe_secret_key.get_secret_value()}", "Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=10):
            return
    except HTTPError as error:
        message = "Stripe subscription update failed"
        try:
            error_payload = json.loads(error.read().decode("utf-8"))
            stripe_message = error_payload.get("error", {}).get("message")
            if isinstance(stripe_message, str) and stripe_message:
                message = f"Stripe subscription update failed: {stripe_message}"
        except (UnicodeDecodeError, json.JSONDecodeError, AttributeError):
            pass
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=message) from None
    except (URLError, TimeoutError):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Stripe subscription update failed") from None


def verify_webhook_signature(payload: bytes, signature: str | None, secret: str, tolerance_seconds: int = 300) -> dict:
    if not signature:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Stripe signature is required")
    parts = dict(part.split("=", 1) for part in signature.split(",") if "=" in part)
    timestamp = parts.get("t")
    received = parts.get("v1")
    if not timestamp or not received:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Stripe signature")
    try:
        timestamp_value = int(timestamp)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Stripe signature timestamp") from None
    if abs(time.time() - timestamp_value) > tolerance_seconds:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Expired Stripe signature")

    signed_payload = f"{timestamp}.".encode() + payload
    expected = hmac.new(secret.encode(), signed_payload, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, received):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Stripe signature")
    try:
        return json.loads(payload)
    except json.JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Stripe event payload") from None


def create_checkout_session(settings: Settings, order: Order, success_url: str, cancel_url: str) -> tuple[str, str]:
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Stripe is not configured")

    fields: list[tuple[str, str]] = [
        ("mode", "payment"),
        ("success_url", success_url),
        ("cancel_url", cancel_url),
        ("metadata[order_id]", str(order.id)),
    ]
    for index, item in enumerate(order.items):
        prefix = f"line_items[{index}]"
        fields.extend([
            (f"{prefix}[price_data][currency]", order.currency_code.lower()),
            (f"{prefix}[price_data][product_data][name]", item.coffee_name),
            (f"{prefix}[price_data][unit_amount]", str(item.unit_price_cents)),
            (f"{prefix}[quantity]", str(item.quantity)),
        ])
    if order.shipping_cents:
        prefix = f"line_items[{len(order.items)}]"
        fields.extend([
            (f"{prefix}[price_data][currency]", order.currency_code.lower()),
            (f"{prefix}[price_data][product_data][name]", "Shipping"),
            (f"{prefix}[price_data][unit_amount]", str(order.shipping_cents)),
            (f"{prefix}[quantity]", "1"),
        ])

    request = Request(
        "https://api.stripe.com/v1/checkout/sessions",
        data=urlencode(fields).encode(),
        headers={
            "Authorization": f"Bearer {settings.stripe_secret_key.get_secret_value()}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=10) as response:
            payload = json.load(response)
    except (HTTPError, URLError, TimeoutError, ValueError):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Stripe checkout session failed") from None

    session_id = payload.get("id")
    checkout_url = payload.get("url")
    if not isinstance(session_id, str) or not isinstance(checkout_url, str):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Stripe returned an invalid checkout session")
    return session_id, checkout_url
