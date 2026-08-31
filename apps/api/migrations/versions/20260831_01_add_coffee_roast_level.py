"""add coffee roast level

Revision ID: 20260831_01
Revises: 20260830_04
Create Date: 2026-08-31 09:15:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260831_01"
down_revision = "20260830_04"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "coffees",
        sa.Column(
            "roast_level",
            sa.String(length=40),
            nullable=False,
            server_default=sa.text("'medium'"),
        ),
    )

    connection = op.get_bind()
    connection.execute(
        sa.text(
            """
            UPDATE coffees
            SET roast_level = CASE
                WHEN lower(COALESCE(process, '')) LIKE '%washed%' THEN 'light'
                WHEN lower(COALESCE(process, '')) LIKE '%honey%' THEN 'medium'
                WHEN lower(COALESCE(process, '')) LIKE '%natural%' THEN 'dark'
                ELSE 'medium'
            END
            """
        )
    )


def downgrade() -> None:
    op.drop_column("coffees", "roast_level")
