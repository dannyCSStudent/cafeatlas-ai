from __future__ import annotations

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20260830_03"
down_revision = "20260830_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "coffees",
        sa.Column(
            "currency_code",
            sa.String(length=3),
            nullable=False,
            server_default=sa.text("'USD'"),
        ),
    )
    op.add_column(
        "coffees",
        sa.Column(
            "compare_at_cents",
            sa.Integer(),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("coffees", "compare_at_cents")
    op.drop_column("coffees", "currency_code")
