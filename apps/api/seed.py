from sqlalchemy import select, func

from app.core.settings import get_settings
from app.db.base import Base
from app.db.session import create_db_engine, create_session_factory
from app.models import Coffee, Farm, Producer


def seed_coffees() -> int:
    settings = get_settings()
    engine = create_db_engine(settings)
    Base.metadata.create_all(engine)

    session_factory = create_session_factory(settings)
    with session_factory() as session:
        existing_count = session.scalar(select(func.count()).select_from(Coffee)) or 0
        if existing_count:
            return 0

        producer_esperanza = Producer(
            name="Finca La Esperanza",
            slug="finca-la-esperanza",
            family="Hernandez",
            description="A family producer focused on bright, high-elevation coffees from Chiapas.",
        )
        producer_sierra_sur = Producer(
            name="Cooperativa Sierra Sur",
            slug="cooperativa-sierra-sur",
            family="Collective",
            description="A smallholder cooperative producing balanced coffees from Oaxaca.",
        )
        producer_mirador = Producer(
            name="Rancho El Mirador",
            slug="rancho-el-mirador",
            family="Lopez",
            description="A long-running Veracruz farm known for sweet, fruit-forward lots.",
        )

        farm_esmeralda = Farm(
            producer=producer_esperanza,
            name="Finca La Esperanza",
            slug="finca-la-esperanza",
            state="Chiapas",
            municipality="San Cristobal de las Casas",
            altitude_meters=1650,
            description="A shade-grown highland farm with volcanic soil and cool mornings.",
        )
        farm_sierra_sur = Farm(
            producer=producer_sierra_sur,
            name="Sierra Sur Fields",
            slug="sierra-sur-fields",
            state="Oaxaca",
            municipality="Pluma Hidalgo",
            altitude_meters=1450,
            description="A cooperative of small plots producing structured, chocolate-driven cups.",
        )
        farm_mirador = Farm(
            producer=producer_mirador,
            name="Rancho El Mirador",
            slug="rancho-el-mirador",
            state="Veracruz",
            municipality="Coatepec",
            altitude_meters=1300,
            description="A lush coastal foothill farm with fruit-forward lots and soft acidity.",
        )

        session.add_all(
            [
                producer_esperanza,
                producer_sierra_sur,
                producer_mirador,
                farm_esmeralda,
                farm_sierra_sur,
                farm_mirador,
                Coffee(
                    producer=producer_esperanza,
                    farm=farm_esmeralda,
                    name="Sierra Negra",
                    slug="sierra-negra",
                    origin_state="Chiapas",
                    producer_name="Finca La Esperanza",
                    description="Bright, floral, and citrus-forward with a clean finish.",
                    price_cents=2400,
                    is_featured=True,
                ),
                Coffee(
                    producer=producer_sierra_sur,
                    farm=farm_sierra_sur,
                    name="Oaxaca Reserve",
                    slug="oaxaca-reserve",
                    origin_state="Oaxaca",
                    producer_name="Cooperativa Sierra Sur",
                    description="Chocolate, caramel, and roasted almond with balanced body.",
                    price_cents=2800,
                    is_featured=True,
                ),
                Coffee(
                    producer=producer_mirador,
                    farm=farm_mirador,
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
