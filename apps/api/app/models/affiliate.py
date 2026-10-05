from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Affiliate(Base):
    __tablename__ = "affiliates"
    __table_args__ = (UniqueConstraint("user_id", name="uq_affiliates_user_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    referral_code: Mapped[str] = mapped_column(String(40), nullable=False, unique=True, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="requested", index=True)
    commission_rate_bps: Mapped[int] = mapped_column(Integer, nullable=False, default=1000)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
    )
