from app.core.metadata import get_app_version
from fastapi import HTTPException
from sqlalchemy.exc import OperationalError


def test_health_endpoint_returns_ok(settings) -> None:
    from app.api.v1.health import health

    assert health(settings) == {
        "status": "ok",
        "service": "CafeAtlas AI API",
        "environment": "test",
        "version": get_app_version(),
    }


def test_readiness_endpoint_checks_database(settings, monkeypatch) -> None:
    from app.api.v1.health import readiness

    class Connection:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def execute(self, _statement):
            return None

    class Engine:
        def connect(self):
            return Connection()

    monkeypatch.setattr("app.api.v1.health.create_db_engine", lambda _settings: Engine())

    assert readiness(settings) == {
        "status": "ready",
        "service": "CafeAtlas AI API",
        "environment": "test",
        "version": get_app_version(),
    }


def test_readiness_endpoint_returns_503_when_database_is_unavailable(settings, monkeypatch) -> None:
    from app.api.v1.health import readiness

    def unavailable(_settings):
        raise OperationalError("SELECT 1", {}, Exception("offline"))

    monkeypatch.setattr("app.api.v1.health.create_db_engine", unavailable)

    error = None
    try:
        readiness(settings)
    except HTTPException as exc:
        error = exc

    assert error is not None
    assert error.status_code == 503
    assert error.detail == "Database unavailable."
