from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.metadata import get_app_version


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="CAFEATLAS_", extra="ignore")

    app_name: str = "CafeAtlas AI API"
    app_version: str = Field(default_factory=get_app_version)
    environment: str = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8081",
        ]
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
