from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.coffee import Coffee
from app.models.order import Order
from app.models.order import OrderItem
from app.models.subscription import Subscription
from app.models.wholesale_request import WholesaleRequest
from app.models.producer import Producer


PAID_ORDER_STATUSES = ("paid", "processing", "shipped", "delivered")


def get_admin_analytics(session: Session) -> dict[str, int]:
    return {
        "coffee_count": int(session.scalar(select(func.count(Coffee.id))) or 0),
        "paid_order_count": int(session.scalar(select(func.count(Order.id)).where(Order.status.in_(PAID_ORDER_STATUSES))) or 0),
        "gross_sales_cents": int(session.scalar(select(func.coalesce(func.sum(Order.total_cents), 0)).where(Order.status.in_(PAID_ORDER_STATUSES))) or 0),
        "low_stock_count": int(session.scalar(select(func.count(Coffee.id)).where(Coffee.inventory_units <= 5)) or 0),
        "active_subscription_count": int(session.scalar(select(func.count(Subscription.id)).where(Subscription.status == "active")) or 0),
        "paid_wholesale_count": int(session.scalar(select(func.count(WholesaleRequest.id)).where(WholesaleRequest.status == "paid")) or 0),
    }


def get_customer_analytics(session: Session, user_id: str) -> dict[str, object]:
    paid_orders = session.scalars(
        select(Order)
        .where(Order.user_id == user_id, Order.status.in_(PAID_ORDER_STATUSES))
        .order_by(Order.created_at.desc(), Order.id.desc())
    ).all()
    lifetime_spend = sum(order.total_cents for order in paid_orders)
    return {
        "paid_order_count": len(paid_orders),
        "lifetime_spend_cents": lifetime_spend,
        "average_order_cents": lifetime_spend // len(paid_orders) if paid_orders else 0,
        "active_subscription": session.scalar(
            select(Subscription.id).where(Subscription.user_id == user_id, Subscription.status == "active")
        ) is not None,
        "latest_purchase_at": paid_orders[0].created_at if paid_orders else None,
    }


def get_producer_analytics(session: Session) -> list[dict[str, object]]:
    producers = session.scalars(
        select(Producer).options(selectinload(Producer.coffees)).order_by(Producer.name.asc())
    ).all()
    sales_rows = session.execute(
        select(
            Coffee.producer_id,
            OrderItem.coffee_name,
            func.sum(OrderItem.quantity),
            func.sum(OrderItem.line_total_cents),
        )
        .join(Order, Order.id == OrderItem.order_id)
        .join(Coffee, Coffee.id == OrderItem.coffee_id)
        .where(Order.status.in_(PAID_ORDER_STATUSES))
        .group_by(Coffee.producer_id, OrderItem.coffee_name)
    ).all()
    sales_by_producer: dict[int, list[tuple[str, int, int]]] = {}
    for producer_id, coffee_name, units, sales in sales_rows:
        if producer_id is None:
            continue
        sales_by_producer.setdefault(producer_id, []).append((coffee_name, int(units or 0), int(sales or 0)))
    monthly_rows = session.execute(
        select(Coffee.producer_id, Order.created_at, OrderItem.quantity, OrderItem.line_total_cents)
        .join(Order, Order.id == OrderItem.order_id)
        .join(Coffee, Coffee.id == OrderItem.coffee_id)
        .where(Order.status.in_(PAID_ORDER_STATUSES))
    ).all()
    monthly_by_producer: dict[int, dict[str, list[int]]] = {}
    for producer_id, created_at, units, sales in monthly_rows:
        if producer_id is None:
            continue
        month = created_at.strftime("%Y-%m")
        monthly_by_producer.setdefault(producer_id, {}).setdefault(month, [0, 0])
        monthly_by_producer[producer_id][month][0] += int(units or 0)
        monthly_by_producer[producer_id][month][1] += int(sales or 0)

    result: list[dict[str, object]] = []
    for producer in producers:
        sales = sales_by_producer.get(producer.id, [])
        top_coffee = max(sales, key=lambda item: item[1], default=None)
        result.append({
            "producer_id": producer.id,
            "producer_name": producer.name,
            "coffee_count": len(producer.coffees),
            "current_inventory_units": sum(coffee.inventory_units for coffee in producer.coffees),
            "paid_units_sold": sum(item[1] for item in sales),
            "paid_sales_cents": sum(item[2] for item in sales),
            "top_coffee_name": top_coffee[0] if top_coffee else None,
            "monthly_sales": [
                {"month": month, "units_sold": values[0], "sales_cents": values[1]}
                for month, values in sorted(monthly_by_producer.get(producer.id, {}).items())
            ],
            "estimated_months_of_stock": round(
                sum(coffee.inventory_units for coffee in producer.coffees)
                / (sum(item[1] for item in sales) / len(monthly_by_producer.get(producer.id, {}))),
                1,
            )
            if sales and monthly_by_producer.get(producer.id)
            else None,
        })
    return result


def get_customer_analytics_overview(session: Session) -> dict[str, object]:
    paid_orders = session.scalars(select(Order).where(Order.status.in_(PAID_ORDER_STATUSES))).all()
    spend_by_customer: dict[str, int] = {}
    for order in paid_orders:
        spend_by_customer[order.user_id] = spend_by_customer.get(order.user_id, 0) + order.total_cents
    coffee_row = session.execute(
        select(OrderItem.coffee_name, func.sum(OrderItem.quantity))
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status.in_(PAID_ORDER_STATUSES))
        .group_by(OrderItem.coffee_name)
        .order_by(func.sum(OrderItem.quantity).desc())
    ).first()
    customer_count = len(spend_by_customer)
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)

    def as_utc(value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    recent_customers = {order.user_id for order in paid_orders if as_utc(order.created_at) >= cutoff}
    prior_customers = {order.user_id for order in paid_orders if as_utc(order.created_at) < cutoff}
    retained_customer_count = len(recent_customers & prior_customers)
    retention_rate_bps = (retained_customer_count * 10000) // len(recent_customers) if recent_customers else 0
    return {
        "paying_customer_count": customer_count,
        "repeat_customer_count": sum(1 for order_count in {user_id: sum(1 for order in paid_orders if order.user_id == user_id) for user_id in spend_by_customer}.values() if order_count > 1),
        "lifetime_value_cents": sum(spend_by_customer.values()),
        "average_lifetime_value_cents": sum(spend_by_customer.values()) // customer_count if customer_count else 0,
        "active_subscriber_count": int(session.scalar(select(func.count(Subscription.id)).where(Subscription.status == "active")) or 0),
        "most_purchased_coffee": coffee_row[0] if coffee_row else None,
        "retained_customer_count": retained_customer_count,
        "retention_rate_bps": retention_rate_bps,
    }
