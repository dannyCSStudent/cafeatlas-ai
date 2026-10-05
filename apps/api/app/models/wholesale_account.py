from datetime import datetime, timezone

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class WholesaleAccount(Base):
    __tablename__ = "wholesale_accounts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    company_name: Mapped[str] = mapped_column(String(180), nullable=False)
    contact_name: Mapped[str] = mapped_column(String(180), nullable=False)
    billing_email: Mapped[str] = mapped_column(String(320), nullable=False)
    country_code: Mapped[str] = mapped_column(String(2), nullable=False, default="US")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=lambda: datetime.now(timezone.utc), default=lambda: datetime.now(timezone.utc))
