from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class StateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    created_at: datetime
    farm_count: int = Field(ge=0)
    coffee_count: int = Field(ge=0)
