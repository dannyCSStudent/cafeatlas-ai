from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProducerSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    family: str | None = None
    description: str | None = None
    created_at: datetime


class FarmSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    producer_id: int
    name: str
    slug: str
    state: str
    municipality: str | None = None
    altitude_meters: int | None = None
    description: str | None = None
    created_at: datetime


class FarmRead(FarmSummary):
    producer: ProducerSummary | None = None


class ProducerRead(ProducerSummary):
    farms: list[FarmSummary] = Field(default_factory=list)
