"""create coffee reviews

Revision ID: 20261003_01
Revises: 20261001_02
"""

from alembic import op
import sqlalchemy as sa


revision = "20261003_01"
down_revision = "20261001_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("coffee_id", sa.Integer(), sa.ForeignKey("coffees.id", ondelete="CASCADE"), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.CheckConstraint("rating >= 1 AND rating <= 5", name="ck_reviews_rating_range"),
        sa.UniqueConstraint("user_id", "coffee_id", name="uq_reviews_user_coffee"),
    )
    op.create_index("ix_reviews_user_id", "reviews", ["user_id"])
    op.create_index("ix_reviews_coffee_id", "reviews", ["coffee_id"])


def downgrade() -> None:
    op.drop_index("ix_reviews_coffee_id", table_name="reviews")
    op.drop_index("ix_reviews_user_id", table_name="reviews")
    op.drop_table("reviews")
