from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.settings import Settings, get_settings
from app.db.session import get_db_session
from app.repositories.coffees import count_coffees, create_coffee, get_coffee_by_slug, list_coffees
from app.schemas.coffee import CoffeeCreate, CoffeeListPage, CoffeeRead

router = APIRouter(tags=["coffees"])


ALLOWED_COFFEE_SORTS = {"newest", "oldest", "price_asc", "price_desc", "featured"}


@router.get("/coffees", response_model=CoffeeListPage)
def coffees(
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
    q: str | None = None,
    state: str | None = None,
    producer_slug: str | None = None,
    featured: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    sort: str = "newest",
) -> CoffeeListPage:
    _ = settings
    if page < 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="page must be greater than 0")
    if page_size < 1 or page_size > 100:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="page_size must be between 1 and 100")
    if sort not in ALLOWED_COFFEE_SORTS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid coffee sort")

    items = [
        CoffeeRead.model_validate(coffee)
        for coffee in list_coffees(
            session,
            q=q,
            state=state,
            producer_slug=producer_slug,
            featured=featured,
            page=page,
            page_size=page_size,
            sort=sort,
        )
    ]
    total = count_coffees(
        session,
        q=q,
        state=state,
        producer_slug=producer_slug,
        featured=featured,
    )
    total_pages = (total + page_size - 1) // page_size if total else 0
    return CoffeeListPage(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1,
    )


@router.get("/coffees/{slug}", response_model=CoffeeRead)
def coffee_detail(
    slug: str,
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> CoffeeRead:
    _ = settings
    coffee = get_coffee_by_slug(session, slug)
    if coffee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coffee not found")
    return CoffeeRead.model_validate(coffee)


@router.post("/coffees", response_model=CoffeeRead, status_code=status.HTTP_201_CREATED)
def create_coffee_route(
    payload: CoffeeCreate,
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> CoffeeRead:
    _ = settings

    if get_coffee_by_slug(session, payload.slug) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Coffee slug already exists")

    coffee = create_coffee(session, payload)
    return CoffeeRead.model_validate(coffee)
