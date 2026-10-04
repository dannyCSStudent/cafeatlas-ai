from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class WholesaleRequest(Base):
    __tablename__ = "wholesale_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    company_name: Mapped[str] = mapped_column(String(180), nullable=False)
    contact_name: Mapped[str] = mapped_column(String(180), nullable=False)
    estimated_boxes: Mapped[int] = mapped_column(Integer, nullable=False)
    delivery_country: Mapped[str] = mapped_column(String(2), nullable=False, default="US")
    note: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="requested", index=True)
    quote_total_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)
    price_per_box_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)
    quote_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    quoted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=lambda: datetime.now(timezone.utc))
