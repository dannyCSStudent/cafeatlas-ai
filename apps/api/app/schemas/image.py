from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ImageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    coffee_id: int | None = None
    farm_id: int | None = None
    producer_id: int | None = None
    image_url: str
    alt_text: str | None = None
    caption: str | None = None
    sort_order: int
    created_at: datetime
