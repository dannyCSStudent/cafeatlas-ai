from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WishlistItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    coffee_id: int
    coffee_name: str | None = None
    coffee_slug: str | None = None
    origin_state: str | None = None
    price_cents: int | None = None
    created_at: datetime
