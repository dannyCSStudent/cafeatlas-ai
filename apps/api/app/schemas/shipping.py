from pydantic import BaseModel, ConfigDict


class ShippingOptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    country_code: str
    shipping_cents: int
    currency_code: str
