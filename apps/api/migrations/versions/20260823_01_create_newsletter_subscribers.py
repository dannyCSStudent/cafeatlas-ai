from __future__ import annotations

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20260823_01"
down_revision = "20260630_05"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "newsletter_subscribers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_newsletter_subscribers_email",
        "newsletter_subscribers",
        ["email"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_newsletter_subscribers_email", table_name="newsletter_subscribers")
    op.drop_table("newsletter_subscribers")
