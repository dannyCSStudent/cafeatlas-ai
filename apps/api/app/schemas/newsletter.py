from datetime import datetime

from pydantic import BaseModel, Field


class NewsletterSubscribeRequest(BaseModel):
    email: str = Field(
        min_length=3,
        max_length=255,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
    )


class NewsletterSubscribeResponse(BaseModel):
    email: str
    subscribed: bool
    created_at: datetime
