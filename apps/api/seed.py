from sqlalchemy import select, func

from app.core.settings import get_settings
from app.db.base import Base
from app.db.session import create_db_engine, create_session_factory
from app.models import Coffee


def seed_coffees() -> int:
    settings = get_settings()
    engine = create_db_engine(settings)
    Base.metadata.create_all(engine)

    session_factory = create_session_factory(settings)
    with session_factory() as session:
        existing_count = session.scalar(select(func.count()).select_from(Coffee)) or 0
        if existing_count:
            return 0

        session.add_all(
            [
                Coffee(
                    name="Sierra Negra",
                    slug="sierra-negra",
                    origin_state="Chiapas",
                    producer_name="Finca La Esperanza",
                    description="Bright, floral, and citrus-forward with a clean finish.",
                    price_cents=2400,
                    is_featured=True,
                ),
                Coffee(
                    name="Oaxaca Reserve",
                    slug="oaxaca-reserve",
                    origin_state="Oaxaca",
                    producer_name="Cooperativa Sierra Sur",
                    description="Chocolate, caramel, and roasted almond with balanced body.",
                    price_cents=2800,
                    is_featured=True,
                ),
                Coffee(
                    name="Veracruz Heritage",
                    slug="veracruz-heritage",
                    origin_state="Veracruz",
                    producer_name="Rancho El Mirador",
                    description="Sweet stone fruit, panela, and a silky mouthfeel.",
                    price_cents=2650,
                    is_featured=False,
                ),
            ]
        )
        session.commit()
        return 3


if __name__ == "__main__":
    created = seed_coffees()
    print(f"Seeded {created} coffees")
