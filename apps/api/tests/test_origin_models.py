from sqlalchemy import create_engine

from app.db.base import Base
from app.models import Farm, Producer


def test_origin_models_register_metadata() -> None:
    assert "producers" in Base.metadata.tables
    assert "farms" in Base.metadata.tables


def test_farm_can_reference_producer() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    producer_table = Base.metadata.tables["producers"]
    farm_table = Base.metadata.tables["farms"]

    assert producer_table is not None
    assert farm_table is not None
    assert any(constraint.elements for constraint in farm_table.foreign_key_constraints)


def test_coffee_can_reference_origin_tables() -> None:
    coffee_table = Base.metadata.tables["coffees"]

    assert "producer_id" in coffee_table.c
    assert "farm_id" in coffee_table.c
