from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WholesaleAccountPayload(BaseModel):
    company_name: str = Field(min_length=1, max_length=180)
    contact_name: str = Field(min_length=1, max_length=180)
    billing_email: str = Field(min_length=3, max_length=320)
    country_code: str = Field(default="US", min_length=2, max_length=2)


class WholesaleAccountRead(WholesaleAccountPayload):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
