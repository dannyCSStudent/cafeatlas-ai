from app.core.metadata import get_app_version


def test_version_endpoint_returns_version_payload(settings) -> None:
    from app.api.v1.version import version

    assert version(settings) == {
        "service": "CafeAtlas AI API",
        "environment": "test",
        "version": get_app_version(),
    }
