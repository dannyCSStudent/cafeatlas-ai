from datetime import datetime, timezone

from app.models.coffee import Coffee
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
        description="Bright and floral.",
        price_cents=2400,
        is_featured=True,
        created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
    )

    read = CoffeeRead.model_validate(coffee)

    assert read.slug == "sierra-negra"
    assert read.is_featured is True
