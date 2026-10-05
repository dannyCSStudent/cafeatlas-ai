"""add affiliate attribution to orders

Revision ID: 20261005_08
Revises: 20261005_07
"""

from alembic import op
import sqlalchemy as sa

revision = "20261005_08"
down_revision = "20261005_07"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("affiliate_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_orders_affiliate_id", "orders", "affiliates", ["affiliate_id"], ["id"])
    op.create_index("ix_orders_affiliate_id", "orders", ["affiliate_id"])


def downgrade() -> None:
    op.drop_index("ix_orders_affiliate_id", table_name="orders")
    op.drop_constraint("fk_orders_affiliate_id", "orders", type_="foreignkey")
    op.drop_column("orders", "affiliate_id")
