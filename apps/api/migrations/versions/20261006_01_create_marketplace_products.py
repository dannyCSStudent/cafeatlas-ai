"""create marketplace products

Revision ID: 20261006_01
Revises: 20261005_10
"""

from alembic import op
import sqlalchemy as sa


revision = "20261006_01"
down_revision = "20261005_10"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "marketplace_products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("inventory_units", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("currency_code", sa.String(length=3), nullable=False, server_default="USD"),
        sa.Column("price_cents", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("slug", name="uq_marketplace_products_slug"),
    )
    op.create_index("ix_marketplace_products_slug", "marketplace_products", ["slug"], unique=False)
    op.create_index("ix_marketplace_products_category", "marketplace_products", ["category"], unique=False)
    op.create_index("ix_marketplace_products_created_at", "marketplace_products", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_marketplace_products_created_at", table_name="marketplace_products")
    op.drop_index("ix_marketplace_products_category", table_name="marketplace_products")
    op.drop_index("ix_marketplace_products_slug", table_name="marketplace_products")
    op.drop_table("marketplace_products")
