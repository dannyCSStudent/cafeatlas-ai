from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int | None = None
    kind: str
    title: str
    body: str
    read_at: datetime | None = None
    created_at: datetime
