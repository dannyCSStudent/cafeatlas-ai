from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CoffeeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    origin_state: str
    producer_name: str
    description: str | None = None
    price_cents: int
    is_featured: bool
    created_at: datetime

