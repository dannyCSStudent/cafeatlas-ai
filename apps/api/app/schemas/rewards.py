from pydantic import BaseModel


class RewardsRead(BaseModel):
    points: int
    tier: str
    next_tier: str | None
    points_to_next_tier: int
    qualifying_orders: int
