"""create customer address book

Revision ID: 20261001_01
Revises: 20260930_01
Create Date: 2026-10-01 10:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20261001_01"
down_revision = "20260930_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "addresses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("label", sa.String(length=80), nullable=False),
        sa.Column("recipient_name", sa.String(length=255), nullable=False),
        sa.Column("address_line1", sa.String(length=255), nullable=False),
        sa.Column("address_line2", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=120), nullable=False),
        sa.Column("region", sa.String(length=120), nullable=False),
        sa.Column("postal_code", sa.String(length=40), nullable=False),
        sa.Column("country_code", sa.String(length=2), nullable=False, server_default="US"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("user_id", "label", name="uq_addresses_user_label"),
    )
    op.create_index("ix_addresses_user_id", "addresses", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_addresses_user_id", table_name="addresses")
    op.drop_table("addresses")
