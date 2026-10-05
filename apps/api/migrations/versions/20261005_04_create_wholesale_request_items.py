"""create wholesale request items

Revision ID: 20261005_04
Revises: 20261005_03
"""

from alembic import op
import sqlalchemy as sa

revision = "20261005_04"
down_revision = "20261005_03"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "wholesale_request_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("wholesale_request_id", sa.Integer(), sa.ForeignKey("wholesale_requests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("coffee_id", sa.Integer(), sa.ForeignKey("coffees.id"), nullable=False),
        sa.Column("coffee_name", sa.String(length=255), nullable=False),
        sa.Column("coffee_slug", sa.String(length=255), nullable=False),
        sa.Column("quantity_boxes", sa.Integer(), nullable=False),
    )
    op.create_index("ix_wholesale_request_items_request_id", "wholesale_request_items", ["wholesale_request_id"])
    op.create_index("ix_wholesale_request_items_coffee_id", "wholesale_request_items", ["coffee_id"])


def downgrade() -> None:
    op.drop_index("ix_wholesale_request_items_coffee_id", table_name="wholesale_request_items")
    op.drop_index("ix_wholesale_request_items_request_id", table_name="wholesale_request_items")
    op.drop_table("wholesale_request_items")
