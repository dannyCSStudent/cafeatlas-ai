from pydantic import BaseModel, Field, model_validator


class CheckoutLineCreate(BaseModel):
    coffee_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=99)


class CheckoutPrepareRequest(BaseModel):
    items: list[CheckoutLineCreate] = Field(min_length=1, max_length=50)

    @model_validator(mode="after")
    def validate_unique_coffees(self) -> "CheckoutPrepareRequest":
        coffee_ids = [item.coffee_id for item in self.items]
        if len(coffee_ids) != len(set(coffee_ids)):
            raise ValueError("Each coffee may appear only once in the cart")
        return self


class CheckoutLineRead(BaseModel):
    coffee_id: int
    slug: str
    name: str
    quantity: int
    unit_price_cents: int
    line_total_cents: int
    available_inventory_units: int


class CheckoutPrepareRead(BaseModel):
    items: list[CheckoutLineRead]
    subtotal_cents: int
    shipping_cents: int
    tax_cents: int
    total_cents: int
    currency_code: str
    checkout_ready: bool
