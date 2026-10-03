"""add review moderation status

Revision ID: 20261003_02
Revises: 20261003_01
"""

from alembic import op
import sqlalchemy as sa


revision = "20261003_02"
down_revision = "20261003_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("reviews", sa.Column("status", sa.String(length=24), nullable=False, server_default="published"))
    op.create_index("ix_reviews_status", "reviews", ["status"])


def downgrade() -> None:
    op.drop_index("ix_reviews_status", table_name="reviews")
    op.drop_column("reviews", "status")
