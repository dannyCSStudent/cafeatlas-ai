"""add wholesale tracking

Revision ID: 20261005_05
Revises: 20261005_04
"""

from alembic import op
import sqlalchemy as sa

revision = "20261005_05"
down_revision = "20261005_04"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("wholesale_requests", sa.Column("tracking_number", sa.String(length=120), nullable=True))
    op.add_column("wholesale_requests", sa.Column("tracking_url", sa.String(length=500), nullable=True))
    op.add_column("wholesale_requests", sa.Column("shipped_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("wholesale_requests", sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("wholesale_requests", "delivered_at")
    op.drop_column("wholesale_requests", "shipped_at")
    op.drop_column("wholesale_requests", "tracking_url")
    op.drop_column("wholesale_requests", "tracking_number")
