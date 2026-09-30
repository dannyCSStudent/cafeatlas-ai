"""create customer return requests

Revision ID: 20260929_04
Revises: 20260929_03
Create Date: 2026-09-29 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260929_04"
down_revision = "20260929_03"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "return_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="pending"),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
        sa.UniqueConstraint("order_id", name="uq_return_requests_order_id"),
    )
    op.create_index("ix_return_requests_order_id", "return_requests", ["order_id"])
    op.create_index("ix_return_requests_user_id", "return_requests", ["user_id"])
    op.create_index("ix_return_requests_status", "return_requests", ["status"])


def downgrade() -> None:
    op.drop_index("ix_return_requests_status", table_name="return_requests")
    op.drop_index("ix_return_requests_user_id", table_name="return_requests")
    op.drop_index("ix_return_requests_order_id", table_name="return_requests")
    op.drop_table("return_requests")
