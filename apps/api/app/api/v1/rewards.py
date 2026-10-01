from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.db.session import get_db_session
from app.repositories.rewards import get_rewards
from app.schemas.rewards import RewardsRead

router = APIRouter(tags=["rewards"])


@router.get("/rewards", response_model=RewardsRead)
def rewards(session: Session = Depends(get_db_session), user_id: str = Depends(get_current_user_id)) -> RewardsRead:
    return RewardsRead.model_validate(get_rewards(session, user_id))
