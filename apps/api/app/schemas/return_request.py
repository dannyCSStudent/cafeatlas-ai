from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReturnRequestCreate(BaseModel):
    reason: str = Field(min_length=10, max_length=2000)


class ReturnRequestUpdate(BaseModel):
    status: str = Field(pattern="^(approved|rejected)$")


class ReturnRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    user_id: str
    status: str
    reason: str
    created_at: datetime
    updated_at: datetime
