from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Coffee(Base):
    __tablename__ = "coffees"

    id: Mapped[int] = mapped_column(primary_key=True)
    producer_id: Mapped[int | None] = mapped_column(
        ForeignKey("producers.id"),
        nullable=True,
        index=True,
    )
    farm_id: Mapped[int | None] = mapped_column(ForeignKey("farms.id"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    origin_state: Mapped[str] = mapped_column(String(120), nullable=False)
    producer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    process: Mapped[str | None] = mapped_column(String(80), nullable=True)
    varietal: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tasting_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price_cents: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    producer: Mapped["Producer | None"] = relationship(back_populates="coffees")
    farm: Mapped["Farm | None"] = relationship(back_populates="coffees")
