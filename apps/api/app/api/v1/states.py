from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.settings import Settings, get_settings
from app.db.session import get_db_session
from app.repositories.states import get_state_by_slug, list_states
from app.schemas.state import StateRead

router = APIRouter(tags=["states"])


def _serialize_state_row(state, farm_count: int, coffee_count: int) -> StateRead:
    return StateRead.model_validate(
        {
            "id": state.id,
            "name": state.name,
            "slug": state.slug,
            "created_at": state.created_at,
            "farm_count": farm_count,
            "coffee_count": coffee_count,
        }
    )


@router.get("/states", response_model=list[StateRead])
def states(
    q: str | None = None,
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> list[StateRead]:
    _ = settings
    return [_serialize_state_row(state, farm_count, coffee_count) for state, farm_count, coffee_count in list_states(session, q=q)]


@router.get("/states/{slug}", response_model=StateRead)
def state_detail(
    slug: str,
    session: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> StateRead:
    _ = settings
    row = get_state_by_slug(session, slug)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="State not found")
    state, farm_count, coffee_count = row
    return _serialize_state_row(state, farm_count, coffee_count)
