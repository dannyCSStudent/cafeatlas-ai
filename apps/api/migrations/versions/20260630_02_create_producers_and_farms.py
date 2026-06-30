"""create producers and farms tables

Revision ID: 20260630_02
Revises: 20260630_01
Create Date: 2026-06-30 00:00:01.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260630_02"
down_revision = "20260630_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "producers",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("family", sa.String(length=255), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("slug"),
    )
    op.create_table(
        "farms",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("producer_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("state", sa.String(length=120), nullable=False),
        sa.Column("municipality", sa.String(length=120), nullable=True),
        sa.Column("altitude_meters", sa.Integer(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["producer_id"], ["producers.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_farms_producer_id"), "farms", ["producer_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_farms_producer_id"), table_name="farms")
    op.drop_table("farms")
    op.drop_table("producers")
