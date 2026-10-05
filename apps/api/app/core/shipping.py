from dataclasses import dataclass


@dataclass(frozen=True)
class ShippingOption:
    country_code: str
    shipping_cents: int
    currency_code: str = "USD"


SHIPPING_OPTIONS = (
    ShippingOption(country_code="US", shipping_cents=699),
    ShippingOption(country_code="MX", shipping_cents=1299),
)


def get_shipping_option(country_code: str) -> ShippingOption | None:
    normalized = country_code.strip().upper()
    return next((option for option in SHIPPING_OPTIONS if option.country_code == normalized), None)
