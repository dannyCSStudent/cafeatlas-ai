"""add stripe session to orders

Revision ID: 20260928_03
Revises: 20260928_02
Create Date: 2026-09-28 11:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260928_03"
down_revision = "20260928_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("stripe_session_id", sa.String(length=255), nullable=True))
    op.create_index("ix_orders_stripe_session_id", "orders", ["stripe_session_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_orders_stripe_session_id", table_name="orders")
    op.drop_column("orders", "stripe_session_id")
