from fastapi import APIRouter, Depends, File, UploadFile

from app.core.auth import get_current_user_id
from app.core.openai_audio import transcribe_audio
from app.core.settings import Settings, get_settings


router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    _user_id: str = Depends(get_current_user_id),
    settings: Settings = Depends(get_settings),
) -> dict[str, str]:
    content = await audio.read()
    return {"text": transcribe_audio(settings, content, audio.filename or "recording.webm", audio.content_type)}
