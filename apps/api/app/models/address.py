from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Address(Base):
    __tablename__ = "addresses"
    __table_args__ = (UniqueConstraint("user_id", "label", name="uq_addresses_user_label"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(80), nullable=False)
    recipient_name: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line1: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    region: Mapped[str] = mapped_column(String(120), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(40), nullable=False)
    country_code: Mapped[str] = mapped_column(String(2), nullable=False, default="US")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), default=lambda: datetime.now(timezone.utc)
    )
