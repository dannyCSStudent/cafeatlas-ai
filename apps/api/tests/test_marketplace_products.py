from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.base import Base
from app.models.marketplace_product import MarketplaceProduct
from app.repositories.marketplace_products import count_marketplace_products, list_marketplace_products


def test_marketplace_products_filter_and_sort_by_category() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all([
            MarketplaceProduct(name="Oaxaca Cacao", slug="oaxaca-cacao", category="chocolate", description="Stone-ground cacao", price_cents=1800, inventory_units=4),
            MarketplaceProduct(name="Papantla Vanilla", slug="papantla-vanilla", category="vanilla", description="Whole vanilla beans", price_cents=2400, inventory_units=8),
        ])
        session.commit()
        products = list_marketplace_products(session, category="chocolate", sort="price_desc")

        assert [product.slug for product in products] == ["oaxaca-cacao"]
        assert count_marketplace_products(session, q="vanilla") == 1
