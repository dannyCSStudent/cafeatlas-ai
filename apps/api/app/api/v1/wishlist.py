from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.db.session import get_db_session
from app.repositories.wishlist import list_wishlist_items, remove_wishlist_item, save_wishlist_item
from app.schemas.wishlist import WishlistItemRead

router = APIRouter(tags=["wishlist"])


@router.get("/wishlist", response_model=list[WishlistItemRead])
def wishlist(
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> list[WishlistItemRead]:
    return [
        WishlistItemRead.model_validate(
            {
                **item.__dict__,
                "coffee_name": item.coffee.name,
                "coffee_slug": item.coffee.slug,
                "origin_state": item.coffee.origin_state,
                "price_cents": item.coffee.price_cents,
            }
        )
        for item in list_wishlist_items(session, user_id)
    ]


@router.put("/wishlist/{coffee_id}", response_model=WishlistItemRead)
def save_wishlist(
    coffee_id: int,
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> WishlistItemRead:
    return WishlistItemRead.model_validate(save_wishlist_item(session, coffee_id, user_id))


@router.delete("/wishlist/{coffee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wishlist(
    coffee_id: int,
    session: Session = Depends(get_db_session),
    user_id: str = Depends(get_current_user_id),
) -> Response:
    remove_wishlist_item(session, coffee_id, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
