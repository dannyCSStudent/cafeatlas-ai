import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import HTTPException, status

from app.core.settings import Settings
from app.models.order import Order


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
