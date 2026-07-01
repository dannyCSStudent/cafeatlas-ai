from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.farm import Farm
from app.models.coffee import Coffee
from app.models.producer import Producer
from app.repositories.coffees import count_coffees, create_coffee, get_coffee_by_slug, list_coffees
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


def test_list_coffees_can_paginate_and_sort_by_price() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all(
            [
                Coffee(
                    name="First Roast",
                    slug="first-roast",
                    origin_state="Chiapas",
                    producer_name="Producer One",
                    description="Bright and lively.",
                    price_cents=2500,
                    is_featured=False,
                ),
                Coffee(
                    name="Second Roast",
                    slug="second-roast",
                    origin_state="Oaxaca",
                    producer_name="Producer Two",
                    description="Sweet and round.",
                    price_cents=1800,
                    is_featured=True,
                ),
                Coffee(
                    name="Third Roast",
                    slug="third-roast",
                    origin_state="Veracruz",
                    producer_name="Producer Three",
                    description="Deep and chocolatey.",
                    price_cents=3200,
                    is_featured=False,
                ),
            ]
        )
        session.commit()

        coffees = list_coffees(session, page=1, page_size=2, sort="price_asc")
        total = count_coffees(session)

    assert total == 3
    assert [coffee.slug for coffee in coffees] == ["second-roast", "first-roast"]


def test_list_coffees_can_filter_by_state_producer_and_featured() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        producer_esperanza = Producer(
            name="Finca La Esperanza",
            slug="finca-la-esperanza",
            family="Hernandez",
            description="Family producer from Chiapas.",
        )
        producer_sierra = Producer(
            name="Cooperativa Sierra Sur",
            slug="cooperativa-sierra-sur",
            family="Collective",
            description="Balanced coffees from Oaxaca.",
        )
        session.add_all(
            [
                Coffee(
                    producer=producer_esperanza,
                    farm=Farm(
                        producer=producer_esperanza,
                        name="Finca La Esperanza",
                        slug="finca-la-esperanza",
                        state="Chiapas",
                        municipality="San Cristobal de las Casas",
                        altitude_meters=1650,
                        description="Shade-grown highland farm.",
                    ),
                    name="Sierra Negra",
                    slug="sierra-negra",
                    origin_state="Chiapas",
                    producer_name="Finca La Esperanza",
                    description="Bright and floral.",
                    price_cents=2400,
                    is_featured=True,
                ),
                Coffee(
                    producer=producer_sierra,
                    farm=Farm(
                        producer=producer_sierra,
                        name="Sierra Sur Fields",
                        slug="sierra-sur-fields",
                        state="Oaxaca",
                        municipality="Pluma Hidalgo",
                        altitude_meters=1450,
                        description="Structured and chocolate-driven.",
                    ),
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

        coffees = list_coffees(
            session,
            state="Chiapas",
            producer_slug="finca-la-esperanza",
            featured=True,
        )

    assert [coffee.slug for coffee in coffees] == ["sierra-negra"]


def test_list_coffees_can_search_across_coffee_and_origin_fields() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        producer = Producer(
            name="Finca La Esperanza",
            slug="finca-la-esperanza",
            family="Hernandez",
            description="Family producer from Chiapas.",
        )
        farm = Farm(
            producer=producer,
            name="Sierra Alta",
            slug="sierra-alta",
            state="Chiapas",
            municipality="San Cristobal de las Casas",
            altitude_meters=1650,
            description="Shade-grown highland farm.",
        )
        session.add(
            Coffee(
                producer=producer,
                farm=farm,
                name="Bright Sierra",
                slug="bright-sierra",
                origin_state="Chiapas",
                producer_name="Finca La Esperanza",
                description="Bright and floral.",
                price_cents=2400,
                is_featured=False,
            )
        )
        session.add(
            Coffee(
                name="Oaxaca Reserve",
                slug="oaxaca-reserve",
                origin_state="Oaxaca",
                producer_name="Cooperativa Sierra Sur",
                description="Chocolate and caramel notes.",
                price_cents=2800,
                is_featured=True,
            )
        )
        session.commit()

        coffees = list_coffees(session, q="bright")

    assert [coffee.slug for coffee in coffees] == ["bright-sierra"]


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


def test_get_coffee_by_slug_loads_origin_relationships() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        producer = Producer(
            name="Finca La Esperanza",
            slug="finca-la-esperanza",
            family="Hernandez",
            description="Family producer from Chiapas.",
        )
        farm = Farm(
            producer=producer,
            name="Finca La Esperanza",
            slug="finca-la-esperanza",
            state="Chiapas",
            municipality="San Cristobal de las Casas",
            altitude_meters=1650,
            description="Shade-grown highland farm.",
        )
        session.add(
            Coffee(
                producer=producer,
                farm=farm,
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
    assert coffee.producer is not None
    assert coffee.producer.slug == "finca-la-esperanza"
    assert coffee.farm is not None
    assert coffee.farm.slug == "finca-la-esperanza"


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
