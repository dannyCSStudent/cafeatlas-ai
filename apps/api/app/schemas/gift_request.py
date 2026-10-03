from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class GiftRequestCreate(BaseModel):
    box_name: str = Field(min_length=1, max_length=120)
    quantity: int = Field(default=1, ge=1, le=500)
    delivery_country: str = Field(default="US", min_length=2, max_length=2)
    note: str = Field(min_length=1, max_length=2000)


class GiftRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    box_name: str
    quantity: int
    delivery_country: str
    note: str
    status: str
    created_at: datetime
