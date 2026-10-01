from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AddressPayload(BaseModel):
    label: str = Field(min_length=1, max_length=80)
    recipient_name: str = Field(min_length=1, max_length=255)
    address_line1: str = Field(min_length=1, max_length=255)
    address_line2: str | None = Field(default=None, max_length=255)
    city: str = Field(min_length=1, max_length=120)
    region: str = Field(min_length=1, max_length=120)
    postal_code: str = Field(min_length=1, max_length=40)
    country_code: str = Field(default="US", min_length=2, max_length=2)


class AddressRead(AddressPayload):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
