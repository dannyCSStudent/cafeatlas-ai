"""add wholesale invoice fields

Revision ID: 20261005_01
Revises: 20261004_03
"""

from alembic import op
import sqlalchemy as sa

revision = "20261005_01"
down_revision = "20261004_03"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("wholesale_requests", sa.Column("stripe_invoice_id", sa.String(length=255), nullable=True))
    op.create_unique_constraint("uq_wholesale_requests_stripe_invoice_id", "wholesale_requests", ["stripe_invoice_id"])
    op.add_column("wholesale_requests", sa.Column("invoice_url", sa.String(length=1000), nullable=True))


def downgrade() -> None:
    op.drop_column("wholesale_requests", "invoice_url")
    op.drop_constraint("uq_wholesale_requests_stripe_invoice_id", "wholesale_requests", type_="unique")
    op.drop_column("wholesale_requests", "stripe_invoice_id")
