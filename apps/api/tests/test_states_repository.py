from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models import Coffee, Farm, Producer, State
from app.repositories.states import get_state_by_slug, list_states


def test_list_states_returns_states_in_name_order() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all(
            [
                State(name="Veracruz", slug="veracruz"),
                State(name="Chiapas", slug="chiapas"),
            ]
        )
        session.commit()

        states = list_states(session)

    assert [state.slug for state, _, _ in states] == ["chiapas", "veracruz"]


def test_list_states_counts_related_records() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        chiapas = State(name="Chiapas", slug="chiapas")
        producer = Producer(name="Bright Leaf", slug="bright-leaf", family="Ramos", description=None)
        farm = Farm(
            producer=producer,
            state_record=chiapas,
            name="La Esperanza",
            slug="la-esperanza",
            state="Chiapas",
            municipality="San Cristobal",
            altitude_meters=1600,
            description="Bright cup profile",
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
                    name="Sierra Negra",
                    slug="sierra-negra",
                    origin_state="Chiapas",
                    producer_name="Bright Leaf",
                    description=None,
                    price_cents=1000,
                    is_featured=False,
                ),
            ]
        )
        session.commit()

        states = list_states(session, q="chi")

    assert len(states) == 1
    state, farm_count, coffee_count = states[0]
    assert state.slug == "chiapas"
    assert farm_count == 1
    assert coffee_count == 1


def test_get_state_by_slug_returns_match() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add(State(name="Oaxaca", slug="oaxaca"))
        session.commit()

        state = get_state_by_slug(session, "oaxaca")

    assert state is not None
    assert state[0].name == "Oaxaca"
