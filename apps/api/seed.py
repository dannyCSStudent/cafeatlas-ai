from sqlalchemy import select, func
from urllib.parse import quote

from app.core.settings import get_settings
from app.db.base import Base
from app.db.session import create_db_engine, create_session_factory
from app.models import Coffee, Farm, Producer


def _make_coffee_art(label: str, base_color: str, accent_color: str) -> str:
    svg = f"""
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="{label}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="{base_color}" />
          <stop offset="100%" stop-color="{accent_color}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="56" fill="url(#bg)" />
      <circle cx="240" cy="210" r="150" fill="rgba(255,255,255,0.18)" />
      <circle cx="960" cy="180" r="120" fill="rgba(255,255,255,0.12)" />
      <circle cx="900" cy="700" r="180" fill="rgba(255,255,255,0.1)" />
      <path d="M180 620c85-140 235-220 420-220s335 80 420 220" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="22" stroke-linecap="round" />
      <text x="88" y="120" fill="white" font-family="Arial, sans-serif" font-size="54" font-weight="700">{label}</text>
      <text x="88" y="190" fill="rgba(255,255,255,0.82)" font-family="Arial, sans-serif" font-size="28" font-weight="400">CafeAtlas Story Roast</text>
    </svg>
    """
    compact = " ".join(line.strip() for line in svg.strip().splitlines())
    return "data:image/svg+xml;charset=UTF-8," + quote(compact, safe="")


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
                    process="Washed",
                    varietal="Bourbon, Typica",
                    tasting_notes="Jasmine, orange peel, and honey",
                    image_url=_make_coffee_art("Sierra Negra", "#5d331f", "#b97a47"),
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
                    process="Honey",
                    varietal="Caturra, Mundo Novo",
                    tasting_notes="Caramel, cacao, and toasted almond",
                    image_url=_make_coffee_art("Oaxaca Reserve", "#2f241d", "#8a5f32"),
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
                    process="Natural",
                    varietal="Garnica",
                    tasting_notes="Stone fruit, panela, and cocoa",
                    image_url=_make_coffee_art("Veracruz Heritage", "#52311c", "#9f6a3c"),
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
