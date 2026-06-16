"""Nutrition service entry point.

Wires up the FastAPI app, configures the asyncpg pool lifecycle, and exposes
``/health`` plus the ``/nutrition`` router.
"""

from __future__ import annotations

import sentry_sdk

from app.config.settings import settings

# Sentry init must run before FastAPI/asyncpg imports so the SDK can patch them.
# sentry-sdk 2.x has no `enabled` kwarg — passing it raises
# TypeError: Unknown option 'enabled' and crashes the app on startup (which
# silently blocked EVERY nutrition-service deploy: build OK, boot crash,
# healthcheck fails, Railway keeps the old image). Disable Sentry by passing
# dsn=None in test instead.
sentry_sdk.init(
    dsn=None if settings.is_test else "https://7e23c244e58c91bb1d45c60d7098997d@o4511403615387648.ingest.us.sentry.io/4511403620433920",
    server_name="nutrition-service",
    environment=settings.node_env,
    traces_sample_rate=0.1,
)

from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.config.database import Database
from app.routes.nutrition import router as nutrition_router
from app.services.nutritionix_service import nutritionix_service

# Initialize SlowAPI rate limiter (in-memory; per-IP).
# Default cap of 100 requests / minute is plenty for a per-user nutrition log
# but well below any abuse threshold.
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Open the DB pool on startup, close it on shutdown. Same lifecycle for
    the Nutritionix httpx client."""
    await Database.connect()
    try:
        yield
    finally:
        await nutritionix_service.close()
        await Database.disconnect()


app = FastAPI(
    title="nutrition-service",
    version="1.0.0",
    description="Nutrition tracking, daily/weekly/monthly summaries, and macro logging.",
    lifespan=lifespan,
)

# IP-based rate limiting (100 req/min default). SlowAPIMiddleware applies the
# Limiter's default_limits to every incoming request automatically. Individual
# routes can override with @limiter.limit("X/Y") if needed.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Error handlers (consistent {success:false, error:{}} envelope) ----------

@app.exception_handler(RequestValidationError)
async def validation_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "message": "Validation failed",
                "code": "VALIDATION_ERROR",
                "details": jsonable_encoder(exc.errors()),
            },
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    # Re-raise HTTPExceptions so FastAPI's default handler can apply our
    # detail dict (which already follows the {message, code} convention).
    from fastapi import HTTPException

    if isinstance(exc, HTTPException):
        detail = exc.detail
        if isinstance(detail, dict) and "code" in detail:
            return JSONResponse(status_code=exc.status_code, content={"success": False, "error": detail})
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error": {"message": str(detail), "code": "ERROR"}},
        )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {"message": "An unexpected error occurred", "code": "INTERNAL_ERROR"},
        },
    )


# ---------- Routes ----------

@app.get("/health", tags=["health"])
async def health() -> dict:
    return {
        "success": True,
        "data": {
            "status": "ok",
            "service": "nutrition-service",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }


app.include_router(nutrition_router, prefix="/nutrition", tags=["nutrition"])
