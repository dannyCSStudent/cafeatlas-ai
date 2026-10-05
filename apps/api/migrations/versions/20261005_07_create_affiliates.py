"""create affiliate profiles

Revision ID: 20261005_07
Revises: 20261005_06
"""

from alembic import op
import sqlalchemy as sa

revision = "20261005_07"
down_revision = "20261005_06"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "affiliates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("referral_code", sa.String(length=40), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="requested"),
        sa.Column("commission_rate_bps", sa.Integer(), nullable=False, server_default="1000"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("user_id", name="uq_affiliates_user_id"),
        sa.UniqueConstraint("referral_code", name="uq_affiliates_referral_code"),
    )
    op.create_index("ix_affiliates_user_id", "affiliates", ["user_id"])
    op.create_index("ix_affiliates_referral_code", "affiliates", ["referral_code"])
    op.create_index("ix_affiliates_status", "affiliates", ["status"])


def downgrade() -> None:
    op.drop_index("ix_affiliates_status", table_name="affiliates")
    op.drop_index("ix_affiliates_referral_code", table_name="affiliates")
    op.drop_index("ix_affiliates_user_id", table_name="affiliates")
    op.drop_table("affiliates")
