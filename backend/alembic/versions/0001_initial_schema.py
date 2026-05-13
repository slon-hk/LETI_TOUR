"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-05-11
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(50), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("superadmin", "editor", name="roleenum"),
            nullable=False,
            server_default="editor",
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_users_username", "users", ["username"])

    op.create_table(
        "locations",
        sa.Column("id", sa.String(100), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("corpus", sa.String(20), nullable=False),
        sa.Column("floor", sa.Integer(), nullable=False),
        sa.Column("coordinates", sa.JSON(), nullable=False),
        sa.Column("indoor_position", sa.JSON(), nullable=False),
        sa.Column("overview_position", sa.JSON(), nullable=True),
        sa.Column("panorama", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("markers", sa.JSON(), nullable=False, server_default="[]"),
    )
    op.create_index("ix_locations_corpus", "locations", ["corpus"])
    op.create_index("ix_locations_floor", "locations", ["floor"])


def downgrade() -> None:
    op.drop_table("locations")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS roleenum")
