"""create customer wishlist items

Revision ID: 20260930_01
Revises: 20260929_04
Create Date: 2026-09-30 10:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260930_01"
down_revision = "20260929_04"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "wishlist_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("coffee_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["coffee_id"], ["coffees.id"]),
        sa.UniqueConstraint("user_id", "coffee_id", name="uq_wishlist_user_coffee"),
    )
    op.create_index("ix_wishlist_items_user_id", "wishlist_items", ["user_id"])
    op.create_index("ix_wishlist_items_coffee_id", "wishlist_items", ["coffee_id"])


def downgrade() -> None:
    op.drop_index("ix_wishlist_items_coffee_id", table_name="wishlist_items")
    op.drop_index("ix_wishlist_items_user_id", table_name="wishlist_items")
    op.drop_table("wishlist_items")
