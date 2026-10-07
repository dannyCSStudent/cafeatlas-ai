from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


MARKETPLACE_CATEGORIES = ("chocolate", "vanilla", "honey", "hot_sauce", "regional_food", "artisan")


class MarketplaceProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    category: str
    description: str | None
    image_url: str | None
    inventory_units: int = Field(ge=0)
    currency_code: str = Field(min_length=3, max_length=3)
    price_cents: int = Field(ge=0)
    is_featured: bool
    created_at: datetime


class MarketplaceProductListPage(BaseModel):
    items: list[MarketplaceProductRead]
    page: int
    page_size: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool
