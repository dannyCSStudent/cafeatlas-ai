import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from fastapi import HTTPException

from app.api.v1.coffees import coffee_detail, coffees, create_coffee_route
from app.db.base import Base
from app.models.farm import Farm
from app.models.coffee import Coffee
from app.models.producer import Producer
from app.schemas.coffee import CoffeeCreate


def test_coffee_detail_returns_coffee(settings) -> None:
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

        response = coffee_detail("sierra-negra", session, settings)

    assert response.slug == "sierra-negra"
    assert response.producer is not None
    assert response.producer.slug == "finca-la-esperanza"
    assert response.farm is not None
    assert response.farm.state == "Chiapas"


def test_coffee_detail_returns_404_for_missing_coffee(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        with pytest.raises(HTTPException) as exc_info:
            coffee_detail("missing", session, settings)

    assert exc_info.value.status_code == 404


def test_create_coffee_route_creates_coffee(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        response = create_coffee_route(
            CoffeeCreate(
                name="Oaxaca Reserve",
                slug="oaxaca-reserve",
                origin_state="Oaxaca",
                producer_name="Cooperativa Sierra Sur",
                producer_id=None,
                farm_id=None,
                description="Chocolate and caramel notes.",
                price_cents=2800,
                is_featured=True,
            ),
            session,
            settings,
        )

    assert response.slug == "oaxaca-reserve"


def test_coffees_route_returns_list(settings) -> None:
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

        response = coffees(session, settings)

    assert response.total == 1
    assert response.page == 1
    assert response.page_size == 20
    assert response.total_pages == 1
    assert response.has_next is False
    assert response.has_prev is False
    assert len(response.items) == 1
    assert response.items[0].slug == "sierra-negra"
    assert response.items[0].producer is not None
    assert response.items[0].farm is not None


def test_coffees_route_can_filter_by_state_producer_and_featured(settings) -> None:
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

        response = coffees(
            session,
            settings,
            state="Chiapas",
            producer_slug="finca-la-esperanza",
            featured=True,
        )

    assert response.total == 1
    assert len(response.items) == 1
    assert response.items[0].slug == "sierra-negra"


def test_coffees_route_can_search(settings) -> None:
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

        response = coffees(session, settings, q="bright")

    assert response.total == 1
    assert [item.slug for item in response.items] == ["bright-sierra"]


def test_coffees_route_supports_pagination_and_sorting(settings) -> None:
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

        response = coffees(session, settings, page=1, page_size=2, sort="price_asc")

    assert response.total == 3
    assert response.page == 1
    assert response.page_size == 2
    assert response.total_pages == 2
    assert response.has_next is True
    assert response.has_prev is False
    assert [item.slug for item in response.items] == ["second-roast", "first-roast"]
