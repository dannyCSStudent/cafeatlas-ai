from app.main import create_app
from app.core.metadata import get_app_version
from app.core.settings import Settings


def test_create_app_sets_core_metadata() -> None:
    app = create_app()

    assert app.title == "CafeAtlas AI API"
    assert app.version == get_app_version()


def test_create_app_registers_versioned_routes(app) -> None:
    paths = {getattr(route, "path", None) for route in app.routes}

    assert "/api/v1/coffees" in paths
    assert "/api/v1/coffees/{slug}" in paths
    assert "/api/v1/health" in paths
    assert "/api/v1/version" in paths
    assert "/" in paths


def test_root_endpoint_returns_service_metadata(app) -> None:
    route = next(route for route in app.routes if getattr(route, "path", None) == "/")

    assert route.endpoint() == {
        "service": "CafeAtlas AI API",
        "version": get_app_version(),
        "environment": "test",
    }


def test_settings_parse_csv_cors_origins() -> None:
    settings = Settings(cors_origins="http://localhost:3000, http://127.0.0.1:3000")

    assert settings.cors_origins == [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
