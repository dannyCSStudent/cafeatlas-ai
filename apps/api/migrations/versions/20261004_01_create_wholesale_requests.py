"""create wholesale quote requests

Revision ID: 20261004_01
Revises: 20261003_03
"""

from alembic import op
import sqlalchemy as sa

revision = "20261004_01"
down_revision = "20261003_03"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("wholesale_requests", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.String(length=255), nullable=False), sa.Column("company_name", sa.String(length=180), nullable=False), sa.Column("contact_name", sa.String(length=180), nullable=False), sa.Column("estimated_boxes", sa.Integer(), nullable=False), sa.Column("delivery_country", sa.String(length=2), nullable=False, server_default="US"), sa.Column("note", sa.Text(), nullable=False), sa.Column("status", sa.String(length=24), nullable=False, server_default="requested"), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")))
    op.create_index("ix_wholesale_requests_user_id", "wholesale_requests", ["user_id"])
    op.create_index("ix_wholesale_requests_status", "wholesale_requests", ["status"])


def downgrade() -> None:
    op.drop_index("ix_wholesale_requests_status", table_name="wholesale_requests")
    op.drop_index("ix_wholesale_requests_user_id", table_name="wholesale_requests")
    op.drop_table("wholesale_requests")
