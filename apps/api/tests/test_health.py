from app.core.metadata import get_app_version


def test_health_endpoint_returns_ok(settings) -> None:
    from app.api.v1.health import health

    assert health(settings) == {
        "status": "ok",
        "service": "CafeAtlas AI API",
        "environment": "test",
        "version": get_app_version(),
    }
