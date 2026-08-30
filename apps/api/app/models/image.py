from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ImageAsset(Base):
    __tablename__ = "images"

    id: Mapped[int] = mapped_column(primary_key=True)
    coffee_id: Mapped[int | None] = mapped_column(ForeignKey("coffees.id"), nullable=True, index=True)
    farm_id: Mapped[int | None] = mapped_column(ForeignKey("farms.id"), nullable=True, index=True)
    producer_id: Mapped[int | None] = mapped_column(ForeignKey("producers.id"), nullable=True, index=True)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
    )

    coffee: Mapped["Coffee | None"] = relationship(back_populates="images")
    farm: Mapped["Farm | None"] = relationship(back_populates="images")
    producer: Mapped["Producer | None"] = relationship(back_populates="images")
