from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.coffee import Coffee
from app.repositories.coffees import create_coffee, get_coffee_by_slug, list_coffees
from app.schemas.coffee import CoffeeCreate


def test_list_coffees_returns_coffees_in_recency_order() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all(
            [
                Coffee(
                    id=1,
                    producer_id=None,
                    farm_id=None,
                    name="Sierra Negra",
                    slug="sierra-negra",
                    origin_state="Chiapas",
                    producer_name="Finca La Esperanza",
                    description="Bright and floral.",
                    price_cents=2400,
                    is_featured=False,
                ),
                Coffee(
                    id=2,
                    producer_id=None,
                    farm_id=None,
                    name="Oaxaca Reserve",
                    slug="oaxaca-reserve",
                    origin_state="Oaxaca",
                    producer_name="Cooperativa Sierra Sur",
                    description="Chocolate and caramel notes.",
                    price_cents=2800,
                    is_featured=True,
                ),
            ]
        )
        session.commit()

        coffees = list_coffees(session)

    assert [coffee.slug for coffee in coffees] == ["oaxaca-reserve", "sierra-negra"]


def test_get_coffee_by_slug_returns_match() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add(
            Coffee(
                producer_id=None,
                farm_id=None,
                name="Sierra Negra",
                slug="sierra-negra",
                origin_state="Chiapas",
                producer_name="Finca La Esperanza",
                description="Bright and floral.",
                price_cents=2400,
                is_featured=False,
            )
        )
        session.commit()

        coffee = get_coffee_by_slug(session, "sierra-negra")

    assert coffee is not None
    assert coffee.name == "Sierra Negra"


def test_create_coffee_persists_new_row() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        coffee = create_coffee(
            session,
            CoffeeCreate(
                name="Veracruz Heritage",
                slug="veracruz-heritage",
                origin_state="Veracruz",
                producer_name="Rancho El Mirador",
                producer_id=None,
                farm_id=None,
                description="Sweet stone fruit.",
                price_cents=2650,
                is_featured=True,
            ),
        )

    assert coffee.id is not None
    assert coffee.slug == "veracruz-heritage"
