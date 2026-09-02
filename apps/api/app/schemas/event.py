from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.origin import FarmSummary, ProducerSummary


class EventCoffeeSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    origin_state: str
    producer_name: str
    image_url: str | None = None
    description: str | None = None


class EventSessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    category: str
    summary: str
    description: str | None = None
    starts_at: datetime
    duration_minutes: int
    host_name: str
    audience: str | None = None
    meeting_url: str | None = None
    replay_url: str | None = None
    image_url: str | None = None
    is_featured: bool
    rsvp_count: int = 0
    created_at: datetime
    coffee: EventCoffeeSummary | None = None
    producer: ProducerSummary | None = None
    farm: FarmSummary | None = None


class EventRSVPCreate(BaseModel):
    attendee_name: str = Field(min_length=1, max_length=255)
    attendee_email: str = Field(
        min_length=3,
        max_length=255,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
    )
    user_id: str | None = Field(default=None, max_length=255)
    note: str | None = Field(default=None, max_length=1000)


class EventRSVPRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_session_id: int
    attendee_name: str
    attendee_email: str
    user_id: str | None = None
    note: str | None = None
    created_at: datetime
