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
        database_url="postgresql://postgres:postgres@localhost:5432/cafeatlas_test",
        supabase_url="https://example.supabase.co",
        supabase_anon_key="anon-key",
        supabase_service_role_key="service-role-key",
        openai_api_key="openai-key",
        stripe_secret_key="stripe-secret-key",
        stripe_webhook_secret="stripe-webhook-secret",
        cors_origins=["http://localhost:3000"],
    )


@pytest.fixture()
def app(settings: Settings):
    return create_app(settings)
