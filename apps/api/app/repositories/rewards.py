from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.order import Order

TIERS = ((0, "Explorer"), (100, "Taster"), (300, "Curator"), (750, "Atlas"))
QUALIFYING_STATUSES = {"paid", "processing", "shipped", "delivered"}


def get_rewards(session: Session, user_id: str) -> dict[str, int | str | None]:
    orders = session.scalars(select(Order).where(Order.user_id == user_id, Order.status.in_(QUALIFYING_STATUSES))).all()
    points = sum(max(0, order.subtotal_cents // 100) for order in orders)
    tier_index = max(index for index, (threshold, _name) in enumerate(TIERS) if points >= threshold)
    tier = TIERS[tier_index][1]
    next_tier = TIERS[tier_index + 1] if tier_index + 1 < len(TIERS) else None
    return {
        "points": points,
        "tier": tier,
        "next_tier": next_tier[1] if next_tier else None,
        "points_to_next_tier": max(0, next_tier[0] - points) if next_tier else 0,
        "qualifying_orders": len(orders),
    }
