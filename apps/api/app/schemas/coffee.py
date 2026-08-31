from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.image import ImageRead
from app.schemas.origin import FarmSummary, ProducerSummary


class CoffeeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=255)
    origin_state: str = Field(min_length=1, max_length=120)
    producer_name: str = Field(min_length=1, max_length=255)
    producer_id: int | None = None
    farm_id: int | None = None
    inventory_units: int = Field(default=0, ge=0)
    currency_code: str = Field(default="USD", min_length=3, max_length=3)
    compare_at_cents: int | None = Field(default=None, ge=0)
    process: str | None = Field(default=None, max_length=80)
    roast_level: str | None = Field(default=None, max_length=40)
    varietal: str | None = Field(default=None, max_length=255)
    tasting_notes: str | None = None
    image_url: str | None = None
    description: str | None = None
    price_cents: int = Field(ge=0)
    is_featured: bool = False


class CoffeeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    producer_id: int | None = None
    farm_id: int | None = None
    name: str
    slug: str
    origin_state: str
    producer_name: str
    inventory_units: int | None = Field(default=0, ge=0)
    currency_code: str | None = Field(default="USD", min_length=3, max_length=3)
    compare_at_cents: int | None = Field(default=None, ge=0)
    process: str | None = None
    roast_level: str | None = None
    varietal: str | None = None
    tasting_notes: str | None = None
    image_url: str | None = None
    description: str | None = None
    price_cents: int
    is_featured: bool
    created_at: datetime
    producer: ProducerSummary | None = None
    farm: FarmSummary | None = None
    images: list[ImageRead] = Field(default_factory=list)


class CoffeeListPage(BaseModel):
    items: list[CoffeeRead]
    page: int
    page_size: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool
