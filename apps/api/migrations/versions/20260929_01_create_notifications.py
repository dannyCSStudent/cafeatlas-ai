"""create user notifications

Revision ID: 20260929_01
Revises: 20260928_03
Create Date: 2026-09-29 09:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260929_01"
down_revision = "20260928_03"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=True),
        sa.Column("kind", sa.String(length=60), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])
    op.create_index("ix_notifications_order_id", "notifications", ["order_id"])


def downgrade() -> None:
    op.drop_index("ix_notifications_order_id", table_name="notifications")
    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.drop_table("notifications")
