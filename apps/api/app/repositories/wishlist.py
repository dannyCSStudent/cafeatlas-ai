from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.coffee import Coffee
from app.models.wishlist import WishlistItem


def list_wishlist_items(session: Session, user_id: str) -> list[WishlistItem]:
    statement = select(WishlistItem).where(WishlistItem.user_id == user_id).options(selectinload(WishlistItem.coffee)).order_by(WishlistItem.created_at.desc(), WishlistItem.id.desc())
    return list(session.scalars(statement).all())


def save_wishlist_item(session: Session, coffee_id: int, user_id: str) -> WishlistItem:
    if session.get(Coffee, coffee_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coffee not found")
    existing = session.scalar(select(WishlistItem).where(WishlistItem.user_id == user_id, WishlistItem.coffee_id == coffee_id))
    if existing is not None:
        return existing
    item = WishlistItem(user_id=user_id, coffee_id=coffee_id)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def remove_wishlist_item(session: Session, coffee_id: int, user_id: str) -> bool:
    item = session.scalar(select(WishlistItem).where(WishlistItem.user_id == user_id, WishlistItem.coffee_id == coffee_id))
    if item is None:
        return False
    session.delete(item)
    session.commit()
    return True
