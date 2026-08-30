from sqlalchemy import create_engine

from app.db.base import Base
import app.models  # noqa: F401


def test_origin_models_register_metadata() -> None:
    assert "producers" in Base.metadata.tables
    assert "farms" in Base.metadata.tables
    assert "images" in Base.metadata.tables
    assert "states" in Base.metadata.tables


def test_farm_can_reference_producer() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    producer_table = Base.metadata.tables["producers"]
    farm_table = Base.metadata.tables["farms"]
    state_table = Base.metadata.tables["states"]

    assert producer_table is not None
    assert farm_table is not None
    assert state_table is not None
    assert "image_url" in producer_table.c
    assert "image_url" in farm_table.c
    assert "image_url" in Base.metadata.tables["images"].c
    assert any(constraint.elements for constraint in farm_table.foreign_key_constraints)
    assert "state_id" in farm_table.c
    assert "origin_state_id" in Base.metadata.tables["coffees"].c
    assert "inventory_units" in Base.metadata.tables["coffees"].c
    assert "currency_code" in Base.metadata.tables["coffees"].c
    assert "compare_at_cents" in Base.metadata.tables["coffees"].c


def test_coffee_can_reference_origin_tables() -> None:
    coffee_table = Base.metadata.tables["coffees"]

    assert "producer_id" in coffee_table.c
    assert "farm_id" in coffee_table.c
