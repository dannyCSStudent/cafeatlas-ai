"""add fulfillment tracking fields

Revision ID: 20260929_02
Revises: 20260929_01
Create Date: 2026-09-29 10:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260929_02"
down_revision = "20260929_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("tracking_number", sa.String(length=120), nullable=True))
    op.add_column("orders", sa.Column("tracking_url", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "tracking_url")
    op.drop_column("orders", "tracking_number")
