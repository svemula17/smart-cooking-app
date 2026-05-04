"""Centralized settings — read .env eagerly and validate required keys.

Failing fast at import time means a misconfigured deployment crashes on
startup rather than producing confusing 500s much later.
"""

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
    port: int
    database_url: str
    redis_url: str
    jwt_secret: str
    jwt_algorithm: str

    openai_api_key: str
    gpt_simple_model: str
    gpt_complex_model: str
    openai_temperature: float
    openai_max_tokens: int

    free_tier_daily_limit: int
    conversation_ttl_seconds: int
    prompt_cache_ttl_seconds: int

    node_env: str
    log_level: str

    @property
    def has_openai_credentials(self) -> bool:
        return bool(self.openai_api_key)

    @property
    def is_test(self) -> bool:
        return self.node_env == "test"


settings = Settings(
    port=_int("PORT", 8002),
    database_url=_required("DATABASE_URL"),
    redis_url=os.environ.get("REDIS_URL", "redis://localhost:6379"),
    jwt_secret=_required("JWT_SECRET"),
    jwt_algorithm=os.environ.get("JWT_ALGORITHM", "HS256"),
    openai_api_key=os.environ.get("OPENAI_API_KEY", ""),
    gpt_simple_model=os.environ.get("GPT_SIMPLE_MODEL", "gpt-3.5-turbo"),
    gpt_complex_model=os.environ.get("GPT_COMPLEX_MODEL", "gpt-4"),
    openai_temperature=float(os.environ.get("OPENAI_TEMPERATURE", "0.7")),
    openai_max_tokens=_int("OPENAI_MAX_TOKENS", 500),
    free_tier_daily_limit=_int("FREE_TIER_DAILY_LIMIT", 5),
    conversation_ttl_seconds=_int("CONVERSATION_TTL_SECONDS", 24 * 60 * 60),
    prompt_cache_ttl_seconds=_int("PROMPT_CACHE_TTL_SECONDS", 60 * 60),
    node_env=os.environ.get("NODE_ENV", "development"),
    log_level=os.environ.get("LOG_LEVEL", "info"),
)
