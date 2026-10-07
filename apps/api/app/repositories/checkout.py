from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.coffee import Coffee
from app.models.marketplace_product import MarketplaceProduct
from app.schemas.checkout import CheckoutLineCreate, CheckoutLineRead


def prepare_checkout_lines(session: Session, requested_items: list[CheckoutLineCreate]) -> list[CheckoutLineRead]:
    coffee_quantities = {item.coffee_id: item.quantity for item in requested_items if item.coffee_id is not None}
    marketplace_quantities = {item.marketplace_product_id: item.quantity for item in requested_items if item.marketplace_product_id is not None}
    coffees = session.scalars(select(Coffee).where(Coffee.id.in_(coffee_quantities))).all() if coffee_quantities else []
    coffees_by_id = {coffee.id: coffee for coffee in coffees}
    marketplace_products = session.scalars(select(MarketplaceProduct).where(MarketplaceProduct.id.in_(marketplace_quantities))).all() if marketplace_quantities else []
    marketplace_by_id = {product.id: product for product in marketplace_products}

    missing_coffee_ids = sorted(set(coffee_quantities) - set(coffees_by_id))
    missing_marketplace_ids = sorted(set(marketplace_quantities) - set(marketplace_by_id))
    if missing_coffee_ids or missing_marketplace_ids:
        missing = [f"coffee {item_id}" for item_id in missing_coffee_ids] + [f"marketplace product {item_id}" for item_id in missing_marketplace_ids]
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product not found: {', '.join(missing)}",
        )

    lines: list[CheckoutLineRead] = []
    for coffee_id, quantity in coffee_quantities.items():
        coffee = coffees_by_id[coffee_id]
        if coffee.inventory_units < quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"{coffee.name} has only {coffee.inventory_units} units available.",
            )
        lines.append(
            CheckoutLineRead(
                coffee_id=coffee.id,
                marketplace_product_id=None,
                slug=coffee.slug,
                name=coffee.name,
                quantity=quantity,
                unit_price_cents=coffee.price_cents,
                line_total_cents=coffee.price_cents * quantity,
                available_inventory_units=coffee.inventory_units,
            )
        )
    for product_id, quantity in marketplace_quantities.items():
        product = marketplace_by_id[product_id]
        if product.inventory_units < quantity:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"{product.name} has only {product.inventory_units} units available.")
        lines.append(CheckoutLineRead(
            coffee_id=None,
            marketplace_product_id=product.id,
            slug=product.slug,
            name=product.name,
            quantity=quantity,
            unit_price_cents=product.price_cents,
            line_total_cents=product.price_cents * quantity,
            available_inventory_units=product.inventory_units,
        ))
    return lines
