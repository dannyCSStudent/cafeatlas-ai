"""add wholesale coffee preferences

Revision ID: 20261005_03
Revises: 20261005_02
"""

from alembic import op
import sqlalchemy as sa

revision = "20261005_03"
down_revision = "20261005_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("wholesale_requests", sa.Column("coffee_preferences", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("wholesale_requests", "coffee_preferences")
