"""Centralized environment configuration. Reads .env eagerly via python-dotenv
and validates required values at import time so the process fails fast on
misconfiguration."""

from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


def _required(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


def _int(name: str, default: int) -> int:
    raw = os.environ.get(name)
    if raw is None or raw == "":
        return default
    try:
        return int(raw)
    except ValueError as exc:
        raise RuntimeError(f"Env var {name} must be an integer") from exc


@dataclass(frozen=True)
class Settings:
    """Frozen, importable view of runtime configuration."""

    port: int
    database_url: str
    jwt_secret: str
    jwt_algorithm: str
    nutritionix_app_id: str
    nutritionix_api_key: str
    nutritionix_base_url: str
    node_env: str
    log_level: str

    @property
    def has_nutritionix_credentials(self) -> bool:
        return bool(self.nutritionix_app_id and self.nutritionix_api_key)

    @property
    def is_test(self) -> bool:
        return self.node_env == "test"


settings = Settings(
    port=_int("PORT", 8001),
    database_url=_required("DATABASE_URL"),
    jwt_secret=_required("JWT_SECRET"),
    jwt_algorithm=os.environ.get("JWT_ALGORITHM", "HS256"),
    nutritionix_app_id=os.environ.get("NUTRITIONIX_APP_ID", ""),
    nutritionix_api_key=os.environ.get("NUTRITIONIX_API_KEY", ""),
    nutritionix_base_url=os.environ.get(
        "NUTRITIONIX_BASE_URL", "https://trackapi.nutritionix.com/v2"
    ),
    node_env=os.environ.get("NODE_ENV", "development"),
    log_level=os.environ.get("LOG_LEVEL", "info"),
)
