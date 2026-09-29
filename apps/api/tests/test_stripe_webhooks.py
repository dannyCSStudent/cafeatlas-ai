import hashlib
import hmac
import json
import time

import pytest
from fastapi import HTTPException

from app.core.stripe import verify_webhook_signature


def test_verify_webhook_signature_accepts_valid_payload() -> None:
    payload = json.dumps({"type": "checkout.session.completed"}).encode()
    timestamp = str(int(time.time()))
    digest = hmac.new(b"whsec_test", f"{timestamp}.".encode() + payload, hashlib.sha256).hexdigest()

    event = verify_webhook_signature(payload, f"t={timestamp},v1={digest}", "whsec_test")

    assert event["type"] == "checkout.session.completed"


def test_verify_webhook_signature_rejects_tampering() -> None:
    with pytest.raises(HTTPException) as exc_info:
        verify_webhook_signature(b"{}", "t=1,v1=bad", "whsec_test")

    assert exc_info.value.status_code == 400
