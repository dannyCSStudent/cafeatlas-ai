import asyncio

from fastapi.middleware.cors import CORSMiddleware
from app.main import create_app
from app.main import database_error_response
from app.main import database_error_handler
from app.main import LOCALHOST_CORS_ORIGIN_REGEX
from app.core.metadata import get_app_version
from app.core.settings import Settings
from sqlalchemy.exc import OperationalError


def test_create_app_sets_core_metadata() -> None:
    app = create_app()

    assert app.title == "CafeAtlas AI API"
    assert app.version == get_app_version()


def test_create_app_registers_versioned_routes(app) -> None:
    paths = {getattr(route, "path", None) for route in app.routes}

    assert "/api/v1/coffees" in paths
    assert "/api/v1/coffees/{slug}" in paths
    assert "/api/v1/events" in paths
    assert "/api/v1/events/{slug}" in paths
    assert "/api/v1/events/{slug}/rsvps" in paths
    assert "/api/v1/newsletter/subscribe" in paths
    assert "/api/v1/producers" in paths
    assert "/api/v1/producers/{slug}" in paths
    assert "/api/v1/farms" in paths
    assert "/api/v1/farms/{slug}" in paths
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


def test_settings_parse_json_cors_origins() -> None:
    settings = Settings(
        cors_origins='["http://localhost:3000","http://127.0.0.1:3000","http://localhost:8081","http://127.0.0.1:8081"]'
    )

    assert settings.cors_origins == [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ]


def test_settings_load_json_cors_origins_from_env(monkeypatch) -> None:
    monkeypatch.setenv(
        "CAFEATLAS_CORS_ORIGINS",
        '["http://localhost:3000","http://127.0.0.1:3000","http://localhost:8081","http://127.0.0.1:8081"]',
    )

    settings = Settings()

    assert settings.cors_origins == [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ]


def test_create_app_configures_localhost_cors() -> None:
    app = create_app(
        Settings(
            environment="development",
            cors_origins=["http://localhost:3000"],
            database_url="sqlite+pysqlite:///:memory:",
        )
    )

    middleware = app.user_middleware[0]

    assert middleware.cls is CORSMiddleware
    assert middleware.kwargs["allow_origins"] == ["http://localhost:3000"]
    assert middleware.kwargs["allow_origin_regex"] == LOCALHOST_CORS_ORIGIN_REGEX


def test_cors_middleware_allows_localhost_web_origins() -> None:
    async def app(scope, receive, send):
        await send({"type": "http.response.start", "status": 200, "headers": []})
        await send({"type": "http.response.body", "body": b"ok", "more_body": False})

    wrapped = CORSMiddleware(
        app,
        allow_origins=["http://localhost:3000"],
        allow_origin_regex=LOCALHOST_CORS_ORIGIN_REGEX,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    async def invoke():
        messages: list[dict[str, object]] = []
        request_messages = [{"type": "http.request", "body": b"", "more_body": False}]

        async def receive():
            if request_messages:
                return request_messages.pop(0)
            await asyncio.sleep(0)
            return {"type": "http.disconnect"}

        async def send(message):
            messages.append(message)

        scope = {
            "type": "http",
            "http_version": "1.1",
            "method": "GET",
            "path": "/",
            "raw_path": b"/",
            "query_string": b"",
            "headers": [(b"origin", b"http://localhost:8081")],
            "scheme": "http",
            "client": ("testclient", 123),
            "server": ("testserver", 80),
            "root_path": "",
            "extensions": {},
        }
        await wrapped(scope, receive, send)
        return messages

    messages = asyncio.run(invoke())
    response_start = next(message for message in messages if message["type"] == "http.response.start")
    headers = dict(response_start["headers"])

    assert response_start["status"] == 200
    assert headers[b"access-control-allow-origin"] == b"http://localhost:8081"


def test_create_app_registers_database_error_handler() -> None:
    app = create_app(
        Settings(
            environment="development",
            cors_origins=["http://localhost:3000"],
            database_url="sqlite+pysqlite:///:memory:",
        )
    )

    assert app.exception_handlers[OperationalError] is database_error_handler


def test_database_error_response_returns_503_json() -> None:
    response = database_error_response()

    assert response.status_code == 503
    assert response.body == b'{"detail":"Database unavailable."}'
