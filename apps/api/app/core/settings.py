from functools import lru_cache
import json
from pathlib import Path
from typing import Annotated

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic_settings import NoDecode

from app.core.metadata import get_app_version

API_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=API_ROOT / ".env",
        env_file_encoding="utf-8",
        env_prefix="CAFEATLAS_",
        extra="ignore",
    )

    app_name: str = "CafeAtlas AI API"
    app_version: str = Field(default_factory=get_app_version)
    environment: str = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    database_url: str | None = None
    supabase_url: str | None = None
    supabase_anon_key: SecretStr | None = None
    supabase_service_role_key: SecretStr | None = None
    openai_api_key: SecretStr | None = None
    stripe_secret_key: SecretStr | None = None
    stripe_webhook_secret: SecretStr | None = None
    stripe_club_seasonal_price_id: str | None = None
    stripe_club_origin_price_id: str | None = None
    stripe_club_reserve_price_id: str | None = None
    cors_origins: Annotated[
        list[str],
        NoDecode,
    ] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8081",
            "http://127.0.0.1:8081",
        ]
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith("["):
                try:
                    parsed = json.loads(stripped)
                except json.JSONDecodeError:
                    parsed = None
                else:
                    if isinstance(parsed, list):
                        return [str(origin).strip() for origin in parsed if str(origin).strip()]
            return [origin.strip().strip('"').strip("'") for origin in value.split(",") if origin.strip()]
        return value

    @model_validator(mode="after")
    def _validate_production_configuration(self) -> "Settings":
        if self.environment.lower() != "production":
            return self

        missing = [
            name
            for name, value in {
                "CAFEATLAS_DATABASE_URL": self.database_url,
                "CAFEATLAS_SUPABASE_URL": self.supabase_url,
                "CAFEATLAS_SUPABASE_ANON_KEY": self.supabase_anon_key,
                "CAFEATLAS_SUPABASE_SERVICE_ROLE_KEY": self.supabase_service_role_key,
                "CAFEATLAS_STRIPE_SECRET_KEY": self.stripe_secret_key,
                "CAFEATLAS_STRIPE_WEBHOOK_SECRET": self.stripe_webhook_secret,
                "CAFEATLAS_STRIPE_CLUB_SEASONAL_PRICE_ID": self.stripe_club_seasonal_price_id,
                "CAFEATLAS_STRIPE_CLUB_ORIGIN_PRICE_ID": self.stripe_club_origin_price_id,
                "CAFEATLAS_STRIPE_CLUB_RESERVE_PRICE_ID": self.stripe_club_reserve_price_id,
            }.items()
            if value is None or (isinstance(value, SecretStr) and not value.get_secret_value()) or value == ""
        ]
        if not self.cors_origins:
            missing.append("CAFEATLAS_CORS_ORIGINS")
        if missing:
            raise ValueError(f"Missing required production settings: {', '.join(missing)}")
        if any(not origin.startswith("https://") for origin in self.cors_origins):
            raise ValueError("CAFEATLAS_CORS_ORIGINS must contain only HTTPS origins in production")
        return self


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
