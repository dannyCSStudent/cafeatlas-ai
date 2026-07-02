"""add origin image urls

Revision ID: 20260630_05
Revises: 20260630_04
Create Date: 2026-06-30 18:55:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260630_05"
down_revision = "20260630_04"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("producers", sa.Column("image_url", sa.Text(), nullable=True))
    op.add_column("farms", sa.Column("image_url", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("farms", "image_url")
    op.drop_column("producers", "image_url")
