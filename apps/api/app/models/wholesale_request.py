from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

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
    coffee_preferences: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="requested", index=True)
    quote_total_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)
    price_per_box_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)
    quote_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    quoted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    stripe_session_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    stripe_invoice_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    invoice_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    tracking_number: Mapped[str | None] = mapped_column(String(120), nullable=True)
    tracking_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    shipped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=lambda: datetime.now(timezone.utc))

    items: Mapped[list["WholesaleRequestItem"]] = relationship(back_populates="request", cascade="all, delete-orphan", order_by="WholesaleRequestItem.id")
