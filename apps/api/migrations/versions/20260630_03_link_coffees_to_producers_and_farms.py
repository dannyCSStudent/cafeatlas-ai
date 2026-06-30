"""link coffees to producers and farms

Revision ID: 20260630_03
Revises: 20260630_02
Create Date: 2026-06-30 00:00:02.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260630_03"
down_revision = "20260630_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("coffees", sa.Column("producer_id", sa.Integer(), nullable=True))
    op.add_column("coffees", sa.Column("farm_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_coffees_producer_id"), "coffees", ["producer_id"], unique=False)
    op.create_index(op.f("ix_coffees_farm_id"), "coffees", ["farm_id"], unique=False)
    op.create_foreign_key(
        "fk_coffees_producer_id_producers",
        "coffees",
        "producers",
        ["producer_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_coffees_farm_id_farms",
        "coffees",
        "farms",
        ["farm_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_coffees_farm_id_farms", "coffees", type_="foreignkey")
    op.drop_constraint("fk_coffees_producer_id_producers", "coffees", type_="foreignkey")
    op.drop_index(op.f("ix_coffees_farm_id"), table_name="coffees")
    op.drop_index(op.f("ix_coffees_producer_id"), table_name="coffees")
    op.drop_column("coffees", "farm_id")
    op.drop_column("coffees", "producer_id")
