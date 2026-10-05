from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WholesaleRequestItem(Base):
    __tablename__ = "wholesale_request_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    wholesale_request_id: Mapped[int] = mapped_column(ForeignKey("wholesale_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    coffee_id: Mapped[int] = mapped_column(ForeignKey("coffees.id"), nullable=False, index=True)
    coffee_name: Mapped[str] = mapped_column(String(255), nullable=False)
    coffee_slug: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity_boxes: Mapped[int] = mapped_column(Integer, nullable=False)

    request: Mapped["WholesaleRequest"] = relationship(back_populates="items")
