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

    assert len(response) == 1
    assert response[0].slug == "sierra-negra"
    assert response[0].producer is not None
    assert response[0].farm is not None
