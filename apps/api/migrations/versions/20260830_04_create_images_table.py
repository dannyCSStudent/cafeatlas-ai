"""create images table

Revision ID: 20260830_04
Revises: 20260830_03
Create Date: 2026-08-30 14:30:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260830_04"
down_revision = "20260830_03"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("coffee_id", sa.Integer(), nullable=True),
        sa.Column("farm_id", sa.Integer(), nullable=True),
        sa.Column("producer_id", sa.Integer(), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column("alt_text", sa.String(length=255), nullable=True),
        sa.Column("caption", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["coffee_id"], ["coffees.id"]),
        sa.ForeignKeyConstraint(["farm_id"], ["farms.id"]),
        sa.ForeignKeyConstraint(["producer_id"], ["producers.id"]),
    )
    op.create_index("ix_images_coffee_id", "images", ["coffee_id"], unique=False)
    op.create_index("ix_images_farm_id", "images", ["farm_id"], unique=False)
    op.create_index("ix_images_producer_id", "images", ["producer_id"], unique=False)

    connection = op.get_bind()
    connection.execute(
        sa.text(
            """
            INSERT INTO images (coffee_id, image_url, alt_text, caption, sort_order, created_at)
            SELECT id, image_url, name, description, 0, created_at
            FROM coffees
            WHERE image_url IS NOT NULL
            """
        )
    )
    connection.execute(
        sa.text(
            """
            INSERT INTO images (farm_id, image_url, alt_text, caption, sort_order, created_at)
            SELECT id, image_url, name, description, 0, created_at
            FROM farms
            WHERE image_url IS NOT NULL
            """
        )
    )
    connection.execute(
        sa.text(
            """
            INSERT INTO images (producer_id, image_url, alt_text, caption, sort_order, created_at)
            SELECT id, image_url, name, description, 0, created_at
            FROM producers
            WHERE image_url IS NOT NULL
            """
        )
    )


def downgrade() -> None:
    op.drop_index("ix_images_producer_id", table_name="images")
    op.drop_index("ix_images_farm_id", table_name="images")
    op.drop_index("ix_images_coffee_id", table_name="images")
    op.drop_table("images")
