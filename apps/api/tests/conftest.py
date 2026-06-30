import pytest

from app.core.metadata import get_app_version
from app.core.settings import Settings
from app.main import create_app


@pytest.fixture()
def settings() -> Settings:
    return Settings(
        app_name="CafeAtlas AI API",
        app_version=get_app_version(),
        environment="test",
        debug=True,
        cors_origins=["http://localhost:3000"],
    )


@pytest.fixture()
def app(settings: Settings):
    return create_app(settings)
