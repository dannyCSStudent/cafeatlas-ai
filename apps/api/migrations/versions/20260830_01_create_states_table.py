from __future__ import annotations

import re

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20260830_01"
down_revision = "20260823_01"
branch_labels = None
depends_on = None


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "state"


def upgrade() -> None:
    op.create_table(
        "states",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False, unique=True),
        sa.Column("slug", sa.String(length=120), nullable=False, unique=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )
    op.add_column("farms", sa.Column("state_id", sa.Integer(), nullable=True))
    op.add_column("coffees", sa.Column("origin_state_id", sa.Integer(), nullable=True))
    op.create_index("ix_farms_state_id", "farms", ["state_id"], unique=False)
    op.create_index("ix_coffees_origin_state_id", "coffees", ["origin_state_id"], unique=False)

    connection = op.get_bind()
    state_names = [
        row[0]
        for row in connection.execute(
            sa.text(
                """
                SELECT DISTINCT state AS name FROM farms WHERE state IS NOT NULL
                UNION
                SELECT DISTINCT origin_state AS name FROM coffees WHERE origin_state IS NOT NULL
                ORDER BY name
                """
            )
        ).all()
    ]
    for name in state_names:
        connection.execute(
            sa.text("INSERT INTO states (name, slug) VALUES (:name, :slug)"),
            {"name": name, "slug": _slugify(name)},
        )

    connection.execute(sa.text("UPDATE farms SET state_id = (SELECT id FROM states WHERE states.name = farms.state)"))
    connection.execute(
        sa.text("UPDATE coffees SET origin_state_id = (SELECT id FROM states WHERE states.name = coffees.origin_state)")
    )


def downgrade() -> None:
    op.drop_index("ix_coffees_origin_state_id", table_name="coffees")
    op.drop_index("ix_farms_state_id", table_name="farms")
    op.drop_column("coffees", "origin_state_id")
    op.drop_column("farms", "state_id")
    op.drop_table("states")
