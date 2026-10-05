"""create affiliate click tracking

Revision ID: 20261005_10
Revises: 20261005_09
"""

from alembic import op
import sqlalchemy as sa

revision = "20261005_10"
down_revision = "20261005_09"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "affiliate_clicks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("affiliate_id", sa.Integer(), sa.ForeignKey("affiliates.id"), nullable=False),
        sa.Column("landing_path", sa.String(length=500), nullable=True),
        sa.Column("clicked_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_affiliate_clicks_affiliate_id", "affiliate_clicks", ["affiliate_id"])


def downgrade() -> None:
    op.drop_index("ix_affiliate_clicks_affiliate_id", table_name="affiliate_clicks")
    op.drop_table("affiliate_clicks")
