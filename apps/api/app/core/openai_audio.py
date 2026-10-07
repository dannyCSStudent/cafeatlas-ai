import json
import logging
import uuid
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import HTTPException, status

from app.core.settings import Settings


logger = logging.getLogger(__name__)


def transcribe_audio(settings: Settings, audio: bytes, filename: str, content_type: str | None) -> str:
    if not settings.openai_api_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Voice transcription is not configured")
    if not audio:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Audio recording is empty")
    boundary = f"----CafeAtlas{uuid.uuid4().hex}"
    file_type = content_type or "audio/webm"
    parts = [
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"model\"\r\n\r\nwhisper-1\r\n".encode(),
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"language\"\r\n\r\nen\r\n".encode(),
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"prompt\"\r\n\r\ncoffee, pour-over, AeroPress, French press, espresso, floral, chocolate, honey, natural, washed\r\n".encode(),
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{filename or 'recording.webm'}\"\r\nContent-Type: {file_type}\r\n\r\n".encode(),
        audio,
        f"\r\n--{boundary}--\r\n".encode(),
    ]
    request = Request(
        "https://api.openai.com/v1/audio/transcriptions",
        data=b"".join(parts),
        headers={
            "Authorization": f"Bearer {settings.openai_api_key.get_secret_value()}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=30) as response:
            payload = json.load(response)
    except HTTPError as error:
        try:
            detail = json.loads(error.read().decode("utf-8")).get("error", {}).get("message", "Voice transcription failed")
        except (UnicodeDecodeError, json.JSONDecodeError, AttributeError):
            detail = "Voice transcription failed"
        logger.warning("OpenAI voice transcription rejected audio: status=%s detail=%s", error.code, detail)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail) from None
    except (URLError, TimeoutError, ValueError):
        logger.exception("OpenAI voice transcription request failed")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Voice transcription failed") from None
    text = payload.get("text") if isinstance(payload, dict) else None
    if not isinstance(text, str) or not text.strip():
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Voice transcription returned no text")
    return text.strip()
