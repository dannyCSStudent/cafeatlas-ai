from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    __table_args__ = (UniqueConstraint("user_id", "coffee_id", name="uq_wishlist_user_coffee"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    coffee_id: Mapped[int] = mapped_column(ForeignKey("coffees.id"), nullable=False, index=True)
    coffee: Mapped["Coffee"] = relationship()
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), default=lambda: datetime.now(timezone.utc)
    )
