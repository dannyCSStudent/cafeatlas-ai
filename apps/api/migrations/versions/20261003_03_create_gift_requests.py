"""create gift requests

Revision ID: 20261003_03
Revises: 20261003_02
"""

from alembic import op
import sqlalchemy as sa


revision = "20261003_03"
down_revision = "20261003_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("gift_requests", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.String(length=255), nullable=False), sa.Column("box_name", sa.String(length=120), nullable=False), sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"), sa.Column("delivery_country", sa.String(length=2), nullable=False, server_default="US"), sa.Column("note", sa.Text(), nullable=False), sa.Column("status", sa.String(length=24), nullable=False, server_default="requested"), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")))
    op.create_index("ix_gift_requests_user_id", "gift_requests", ["user_id"])
    op.create_index("ix_gift_requests_status", "gift_requests", ["status"])


def downgrade() -> None:
    op.drop_index("ix_gift_requests_status", table_name="gift_requests")
    op.drop_index("ix_gift_requests_user_id", table_name="gift_requests")
    op.drop_table("gift_requests")
