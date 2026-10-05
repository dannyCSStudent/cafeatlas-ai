"""create affiliate commission ledger

Revision ID: 20261005_09
Revises: 20261005_08
"""

from alembic import op
import sqlalchemy as sa

revision = "20261005_09"
down_revision = "20261005_08"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "affiliate_commissions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("affiliate_id", sa.Integer(), sa.ForeignKey("affiliates.id"), nullable=False),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id"), nullable=False),
        sa.Column("amount_cents", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("order_id", name="uq_affiliate_commissions_order_id"),
    )
    op.create_index("ix_affiliate_commissions_affiliate_id", "affiliate_commissions", ["affiliate_id"])
    op.create_index("ix_affiliate_commissions_order_id", "affiliate_commissions", ["order_id"])
    op.create_index("ix_affiliate_commissions_status", "affiliate_commissions", ["status"])


def downgrade() -> None:
    op.drop_index("ix_affiliate_commissions_status", table_name="affiliate_commissions")
    op.drop_index("ix_affiliate_commissions_order_id", table_name="affiliate_commissions")
    op.drop_index("ix_affiliate_commissions_affiliate_id", table_name="affiliate_commissions")
    op.drop_table("affiliate_commissions")
