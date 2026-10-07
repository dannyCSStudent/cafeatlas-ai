from pydantic import BaseModel, Field, model_validator


class CheckoutLineCreate(BaseModel):
    coffee_id: int | None = Field(default=None, gt=0)
    marketplace_product_id: int | None = Field(default=None, gt=0)
    quantity: int = Field(gt=0, le=99)

    @model_validator(mode="after")
    def validate_product_reference(self) -> "CheckoutLineCreate":
        if (self.coffee_id is None) == (self.marketplace_product_id is None):
            raise ValueError("Each checkout line must reference one coffee or marketplace product")
        return self


class CheckoutPrepareRequest(BaseModel):
    items: list[CheckoutLineCreate] = Field(min_length=1, max_length=50)

    @model_validator(mode="after")
    def validate_unique_products(self) -> "CheckoutPrepareRequest":
        product_keys = [(item.coffee_id, item.marketplace_product_id) for item in self.items]
        if len(product_keys) != len(set(product_keys)):
            raise ValueError("Each coffee may appear only once in the cart")
        return self


class CheckoutLineRead(BaseModel):
    coffee_id: int | None = None
    marketplace_product_id: int | None = None
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
