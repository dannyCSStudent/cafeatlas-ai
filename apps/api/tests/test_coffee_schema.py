from datetime import datetime, timezone

from app.models.farm import Farm
from app.models.coffee import Coffee
from app.models.producer import Producer
from app.schemas.coffee import CoffeeRead


def test_coffee_read_validates_from_orm_object() -> None:
    coffee = Coffee(
        id=1,
        producer_id=None,
        farm_id=None,
        name="Sierra Negra",
        slug="sierra-negra",
        origin_state="Chiapas",
        producer_name="Finca La Esperanza",
        process="Washed",
        varietal="Bourbon, Typica",
        tasting_notes="Jasmine, orange peel, and honey",
        image_url="data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
        description="Bright and floral.",
        price_cents=2400,
        is_featured=True,
        created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
    )

    read = CoffeeRead.model_validate(coffee)

    assert read.slug == "sierra-negra"
    assert read.is_featured is True
    assert read.process == "Washed"
    assert read.varietal == "Bourbon, Typica"
    assert read.tasting_notes == "Jasmine, orange peel, and honey"
    assert read.image_url is not None


def test_coffee_read_validates_nested_origin_objects() -> None:
    producer = Producer(
        id=2,
        name="Finca La Esperanza",
        slug="finca-la-esperanza",
        family="Hernandez",
        description="Family producer from Chiapas.",
        created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
    )
    farm = Farm(
        id=3,
        producer_id=2,
        name="Finca La Esperanza",
        slug="finca-la-esperanza",
        state="Chiapas",
        municipality="San Cristobal de las Casas",
        altitude_meters=1650,
        description="Shade-grown highland farm.",
        created_at=datetime(2026, 1, 2, tzinfo=timezone.utc),
    )
    coffee = Coffee(
        id=1,
        producer_id=2,
        farm_id=3,
        name="Sierra Negra",
        slug="sierra-negra",
        origin_state="Chiapas",
        producer_name="Finca La Esperanza",
        process="Washed",
        varietal="Bourbon, Typica",
        tasting_notes="Jasmine, orange peel, and honey",
        image_url="data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
        description="Bright and floral.",
        price_cents=2400,
        is_featured=True,
        created_at=datetime(2026, 1, 3, tzinfo=timezone.utc),
        producer=producer,
        farm=farm,
    )

    read = CoffeeRead.model_validate(coffee)

    assert read.producer is not None
    assert read.producer.slug == "finca-la-esperanza"
    assert read.farm is not None
    assert read.farm.state == "Chiapas"
    assert read.image_url is not None
