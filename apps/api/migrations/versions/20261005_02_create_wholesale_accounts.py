"""create wholesale accounts

Revision ID: 20261005_02
Revises: 20261005_01
"""

from alembic import op
import sqlalchemy as sa

revision = "20261005_02"
down_revision = "20261005_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "wholesale_accounts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("company_name", sa.String(length=180), nullable=False),
        sa.Column("contact_name", sa.String(length=180), nullable=False),
        sa.Column("billing_email", sa.String(length=320), nullable=False),
        sa.Column("country_code", sa.String(length=2), nullable=False, server_default="US"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("user_id", name="uq_wholesale_accounts_user_id"),
    )
    op.create_index("ix_wholesale_accounts_user_id", "wholesale_accounts", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_wholesale_accounts_user_id", table_name="wholesale_accounts")
    op.drop_table("wholesale_accounts")
