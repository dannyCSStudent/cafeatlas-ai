"""add coffee storytelling fields

Revision ID: 20260630_04
Revises: 20260630_03
Create Date: 2026-06-30 18:45:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260630_04"
down_revision = "20260630_03"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("coffees", sa.Column("process", sa.String(length=80), nullable=True))
    op.add_column("coffees", sa.Column("varietal", sa.String(length=255), nullable=True))
    op.add_column("coffees", sa.Column("tasting_notes", sa.Text(), nullable=True))
    op.add_column("coffees", sa.Column("image_url", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("coffees", "image_url")
    op.drop_column("coffees", "tasting_notes")
    op.drop_column("coffees", "varietal")
    op.drop_column("coffees", "process")
