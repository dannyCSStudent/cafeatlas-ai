"""create event sessions

Revision ID: 20260901_01
Revises: 20260831_01
Create Date: 2026-09-01 09:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260901_01"
down_revision = "20260831_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "event_sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=120), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False, server_default=sa.text("60")),
        sa.Column("host_name", sa.String(length=255), nullable=False),
        sa.Column("audience", sa.String(length=255), nullable=True),
        sa.Column("meeting_url", sa.Text(), nullable=True),
        sa.Column("replay_url", sa.Text(), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("coffee_id", sa.Integer(), nullable=True),
        sa.Column("producer_id", sa.Integer(), nullable=True),
        sa.Column("farm_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["coffee_id"], ["coffees.id"]),
        sa.ForeignKeyConstraint(["producer_id"], ["producers.id"]),
        sa.ForeignKeyConstraint(["farm_id"], ["farms.id"]),
    )
    op.create_index("ix_event_sessions_slug", "event_sessions", ["slug"], unique=False)
    op.create_index("ix_event_sessions_category", "event_sessions", ["category"], unique=False)
    op.create_index("ix_event_sessions_starts_at", "event_sessions", ["starts_at"], unique=False)
    op.create_index("ix_event_sessions_coffee_id", "event_sessions", ["coffee_id"], unique=False)
    op.create_index("ix_event_sessions_producer_id", "event_sessions", ["producer_id"], unique=False)
    op.create_index("ix_event_sessions_farm_id", "event_sessions", ["farm_id"], unique=False)

    op.create_table(
        "event_rsvps",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_session_id", sa.Integer(), nullable=False),
        sa.Column("attendee_name", sa.String(length=255), nullable=False),
        sa.Column("attendee_email", sa.String(length=255), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["event_session_id"], ["event_sessions.id"]),
        sa.UniqueConstraint("event_session_id", "attendee_email", name="uq_event_rsvps_event_session_email"),
    )
    op.create_index("ix_event_rsvps_event_session_id", "event_rsvps", ["event_session_id"], unique=False)
    op.create_index("ix_event_rsvps_attendee_email", "event_rsvps", ["attendee_email"], unique=False)
    op.create_index("ix_event_rsvps_user_id", "event_rsvps", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_event_rsvps_user_id", table_name="event_rsvps")
    op.drop_index("ix_event_rsvps_attendee_email", table_name="event_rsvps")
    op.drop_index("ix_event_rsvps_event_session_id", table_name="event_rsvps")
    op.drop_table("event_rsvps")

    op.drop_index("ix_event_sessions_farm_id", table_name="event_sessions")
    op.drop_index("ix_event_sessions_producer_id", table_name="event_sessions")
    op.drop_index("ix_event_sessions_coffee_id", table_name="event_sessions")
    op.drop_index("ix_event_sessions_starts_at", table_name="event_sessions")
    op.drop_index("ix_event_sessions_category", table_name="event_sessions")
    op.drop_index("ix_event_sessions_slug", table_name="event_sessions")
    op.drop_table("event_sessions")
