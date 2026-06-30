from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CoffeeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=255)
    origin_state: str = Field(min_length=1, max_length=120)
    producer_name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    price_cents: int = Field(ge=0)
    is_featured: bool = False


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
