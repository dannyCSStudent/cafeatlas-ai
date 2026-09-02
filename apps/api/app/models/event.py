from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EventSession(Base):
    __tablename__ = "event_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
    host_name: Mapped[str] = mapped_column(String(255), nullable=False)
    audience: Mapped[str | None] = mapped_column(String(255), nullable=True)
    meeting_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    replay_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    coffee_id: Mapped[int | None] = mapped_column(ForeignKey("coffees.id"), nullable=True, index=True)
    producer_id: Mapped[int | None] = mapped_column(ForeignKey("producers.id"), nullable=True, index=True)
    farm_id: Mapped[int | None] = mapped_column(ForeignKey("farms.id"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
    )

    coffee: Mapped["Coffee | None"] = relationship()
    producer: Mapped["Producer | None"] = relationship()
    farm: Mapped["Farm | None"] = relationship()
    rsvps: Mapped[list["EventRSVP"]] = relationship(
        back_populates="event_session",
        cascade="all, delete-orphan",
        order_by=lambda: (EventRSVP.created_at.asc(), EventRSVP.id.asc()),
    )

    @property
    def rsvp_count(self) -> int:
        return len(self.rsvps)


class EventRSVP(Base):
    __tablename__ = "event_rsvps"
    __table_args__ = (
        UniqueConstraint("event_session_id", "attendee_email", name="uq_event_rsvps_event_session_email"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    event_session_id: Mapped[int] = mapped_column(ForeignKey("event_sessions.id"), nullable=False, index=True)
    attendee_name: Mapped[str] = mapped_column(String(255), nullable=False)
    attendee_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    user_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
    )

    event_session: Mapped["EventSession"] = relationship(back_populates="rsvps")
