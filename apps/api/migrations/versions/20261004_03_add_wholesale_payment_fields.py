"""add wholesale payment fields

Revision ID: 20261004_03
Revises: 20261004_02
"""

from alembic import op
import sqlalchemy as sa

revision = "20261004_03"
down_revision = "20261004_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("wholesale_requests", sa.Column("stripe_session_id", sa.String(length=255), nullable=True))
    op.create_unique_constraint("uq_wholesale_requests_stripe_session_id", "wholesale_requests", ["stripe_session_id"])
    op.add_column("wholesale_requests", sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("wholesale_requests", "paid_at")
    op.drop_constraint("uq_wholesale_requests_stripe_session_id", "wholesale_requests", type_="unique")
    op.drop_column("wholesale_requests", "stripe_session_id")
