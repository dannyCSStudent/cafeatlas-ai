"""create wholesale pricing tiers

Revision ID: 20261005_06
Revises: 20261005_05
"""

from alembic import op
import sqlalchemy as sa

revision = "20261005_06"
down_revision = "20261005_05"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "wholesale_pricing_tiers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("min_boxes", sa.Integer(), nullable=False),
        sa.Column("max_boxes", sa.Integer(), nullable=True),
        sa.Column("price_per_box_cents", sa.Integer(), nullable=False),
        sa.Column("currency_code", sa.String(length=3), nullable=False, server_default="USD"),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_wholesale_pricing_tiers_active", "wholesale_pricing_tiers", ["active"])


def downgrade() -> None:
    op.drop_index("ix_wholesale_pricing_tiers_active", table_name="wholesale_pricing_tiers")
    op.drop_table("wholesale_pricing_tiers")
