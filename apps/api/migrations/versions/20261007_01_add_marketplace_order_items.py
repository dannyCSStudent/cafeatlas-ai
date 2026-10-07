"""allow marketplace products in orders

Revision ID: 20261007_01
Revises: 20261006_01
"""

from alembic import op
import sqlalchemy as sa


revision = "20261007_01"
down_revision = "20261006_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("order_items", "coffee_id", existing_type=sa.Integer(), nullable=True)
    op.add_column("order_items", sa.Column("marketplace_product_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_order_items_marketplace_product_id", "order_items", "marketplace_products", ["marketplace_product_id"], ["id"])
    op.create_index("ix_order_items_marketplace_product_id", "order_items", ["marketplace_product_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_order_items_marketplace_product_id", table_name="order_items")
    op.drop_constraint("fk_order_items_marketplace_product_id", "order_items", type_="foreignkey")
    op.drop_column("order_items", "marketplace_product_id")
    op.alter_column("order_items", "coffee_id", existing_type=sa.Integer(), nullable=False)
