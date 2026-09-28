"""add shipping fields to orders

Revision ID: 20260928_02
Revises: 20260928_01
Create Date: 2026-09-28 10:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260928_02"
down_revision = "20260928_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    for name, length in (
        ("recipient_name", 255),
        ("address_line1", 255),
        ("address_line2", 255),
        ("city", 120),
        ("region", 120),
        ("postal_code", 40),
        ("country_code", 2),
    ):
        op.add_column("orders", sa.Column(name, sa.String(length=length), nullable=True))


def downgrade() -> None:
    for name in ("country_code", "postal_code", "region", "city", "address_line2", "address_line1", "recipient_name"):
        op.drop_column("orders", name)
