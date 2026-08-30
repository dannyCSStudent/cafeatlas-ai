import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from fastapi import HTTPException

from app.api.v1.states import state_detail, states
from app.db.base import Base
from app.models import Coffee, Farm, Producer, State


def test_states_route_returns_state_counts(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        chiapas = State(name="Chiapas", slug="chiapas")
        producer = Producer(name="Finca La Esperanza", slug="finca-la-esperanza", family="Hernandez", description=None)
        farm = Farm(
            producer=producer,
            state_record=chiapas,
            name="Finca La Esperanza",
            slug="finca-la-esperanza",
            state="Chiapas",
            municipality="San Cristobal de las Casas",
            altitude_meters=1650,
            description="Shade-grown highland farm.",
        )
        session.add_all(
            [
                chiapas,
                producer,
                farm,
                Coffee(
                    producer=producer,
                    farm=farm,
                    origin_state_record=chiapas,
                    inventory_units=24,
                    name="Sierra Negra",
                    slug="sierra-negra",
                    origin_state="Chiapas",
                    producer_name="Finca La Esperanza",
                    description=None,
                    price_cents=2400,
                    is_featured=True,
                ),
            ]
        )
        session.commit()

        response = states(session=session, settings=settings)

    assert len(response) == 1
    assert response[0].slug == "chiapas"
    assert response[0].farm_count == 1
    assert response[0].coffee_count == 1


def test_state_detail_returns_404_for_missing_state(settings) -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        with pytest.raises(HTTPException) as exc_info:
            state_detail("missing", session, settings)

    assert exc_info.value.status_code == 404
