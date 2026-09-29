"""add coffee barcodes

Revision ID: 20260929_03
Revises: 20260929_02
Create Date: 2026-09-29 11:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260929_03"
down_revision = "20260929_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("coffees", sa.Column("barcode", sa.String(length=32), nullable=True))
    op.create_index("ix_coffees_barcode", "coffees", ["barcode"], unique=True)
    op.execute("UPDATE coffees SET barcode = '7500000000008' WHERE slug = 'sierra-negra' AND barcode IS NULL")
    op.execute("UPDATE coffees SET barcode = '7500000000015' WHERE slug = 'oaxaca-reserve' AND barcode IS NULL")
    op.execute("UPDATE coffees SET barcode = '7500000000022' WHERE slug = 'veracruz-heritage' AND barcode IS NULL")


def downgrade() -> None:
    op.drop_index("ix_coffees_barcode", table_name="coffees")
    op.drop_column("coffees", "barcode")
