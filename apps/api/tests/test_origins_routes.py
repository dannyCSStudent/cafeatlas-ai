import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from fastapi import HTTPException

from app.api.v1.origins import farm_detail, farms, producer_detail, producers
from app.db.base import Base
from app.models.farm import Farm
from app.models.producer import Producer


def test_producers_route_returns_producers_with_farms(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        producer = Producer(
            name="Finca La Esperanza",
            slug="finca-la-esperanza",
            family="Hernandez",
            description="Family producer from Chiapas.",
        )
        session.add(
            Farm(
                producer=producer,
                name="Finca La Esperanza",
                slug="finca-la-esperanza",
                state="Chiapas",
                municipality="San Cristobal de las Casas",
                altitude_meters=1650,
                description="Shade-grown highland farm.",
            )
        )
        session.commit()

        response = producers(session, settings)

    assert len(response) == 1
    assert response[0].slug == "finca-la-esperanza"
    assert len(response[0].farms) == 1


def test_producer_detail_returns_404_for_missing_producer(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        with pytest.raises(HTTPException) as exc_info:
            producer_detail("missing", session, settings)

    assert exc_info.value.status_code == 404


def test_farms_route_returns_farms_with_producer(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        producer = Producer(
            name="Finca La Esperanza",
            slug="finca-la-esperanza",
            family="Hernandez",
            description="Family producer from Chiapas.",
        )
        session.add(
            Farm(
                producer=producer,
                name="Finca La Esperanza",
                slug="finca-la-esperanza",
                state="Chiapas",
                municipality="San Cristobal de las Casas",
                altitude_meters=1650,
                description="Shade-grown highland farm.",
            )
        )
        session.commit()

        response = farms(session, settings)

    assert len(response) == 1
    assert response[0].slug == "finca-la-esperanza"
    assert response[0].producer is not None
    assert response[0].producer.slug == "finca-la-esperanza"


def test_farm_detail_returns_404_for_missing_farm(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        with pytest.raises(HTTPException) as exc_info:
            farm_detail("missing", session, settings)

    assert exc_info.value.status_code == 404
