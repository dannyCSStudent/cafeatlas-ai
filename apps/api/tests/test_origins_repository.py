from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.farm import Farm
from app.models.producer import Producer
from app.repositories.origins import get_farm_by_slug, get_producer_by_slug, list_farms, list_producers


def test_list_producers_returns_producers_in_name_order() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all(
            [
                Producer(name="Zulu", slug="zulu", family=None, description=None),
                Producer(name="Alpha", slug="alpha", family=None, description=None),
            ]
        )
        session.commit()

        producers = list_producers(session)

    assert [producer.slug for producer in producers] == ["alpha", "zulu"]


def test_get_producer_by_slug_returns_match() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add(Producer(name="Alpha", slug="alpha", family=None, description=None))
        session.commit()

        producer = get_producer_by_slug(session, "alpha")

    assert producer is not None
    assert producer.name == "Alpha"


def test_list_producers_filters_by_query() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        producer = Producer(name="Bright Leaf", slug="bright-leaf", family="Ramos", description="Highland producer")
        session.add(producer)
        session.add(
            Farm(
                producer=producer,
                name="La Esperanza",
                slug="la-esperanza",
                state="Chiapas",
                municipality="San Cristobal",
                altitude_meters=1600,
                description="Bright cup profile",
            )
        )
        session.add(Producer(name="Dark Hills", slug="dark-hills", family=None, description=""))
        session.commit()

        producers = list_producers(session, q="bright")

    assert [producer.slug for producer in producers] == ["bright-leaf"]


def test_list_farms_returns_farms_in_state_order() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        producer = Producer(name="Producer", slug="producer", family=None, description=None)
        session.add(
            Farm(
                producer=producer,
                name="Oaxaca Farm",
                slug="oaxaca-farm",
                state="Oaxaca",
                municipality=None,
                altitude_meters=None,
                description=None,
            )
        )
        session.add(
            Farm(
                producer=producer,
                name="Chiapas Farm",
                slug="chiapas-farm",
                state="Chiapas",
                municipality=None,
                altitude_meters=None,
                description=None,
            )
        )
        session.commit()

        farms = list_farms(session)

    assert [farm.slug for farm in farms] == ["chiapas-farm", "oaxaca-farm"]


def test_list_farms_filters_by_query() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        producer = Producer(name="Bright Leaf", slug="bright-leaf", family="Ramos", description="Highland producer")
        session.add(producer)
        session.add(
            Farm(
                producer=producer,
                name="La Esperanza",
                slug="la-esperanza",
                state="Chiapas",
                municipality="San Cristobal",
                altitude_meters=1600,
                description="Bright cup profile",
            )
        )
        session.add(
            Farm(
                producer=producer,
                name="Volcan",
                slug="volcan",
                state="Oaxaca",
                municipality="Oaxaca City",
                altitude_meters=1700,
                description="Deep and smoky",
            )
        )
        session.commit()

        farms = list_farms(session, q="smoky")

    assert [farm.slug for farm in farms] == ["volcan"]


def test_get_farm_by_slug_returns_match() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        producer = Producer(name="Producer", slug="producer", family=None, description=None)
        session.add(
            Farm(
                producer=producer,
                name="Chiapas Farm",
                slug="chiapas-farm",
                state="Chiapas",
                municipality=None,
                altitude_meters=None,
                description=None,
            )
        )
        session.commit()

        farm = get_farm_by_slug(session, "chiapas-farm")

    assert farm is not None
    assert farm.state == "Chiapas"
