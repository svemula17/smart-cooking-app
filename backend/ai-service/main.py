"""AI service entry point.

Manages the lifecycle of the asyncpg pool and Redis client, mounts the
``/ai`` router, and exposes a top-level ``/health`` for probes.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.database import Database
from app.config.redis import RedisClient
from app.routes.ai import router as ai_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await Database.connect()
    await RedisClient.connect()
    try:
        yield
    finally:
        await RedisClient.disconnect()
        await Database.disconnect()


app = FastAPI(
    title="ai-service",
    version="1.0.0",
    description="LangChain-backed cooking assistant, multi-dish coordinator, variety algorithm, and ingredient substitutions.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Error handlers ----------

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


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail
    if isinstance(detail, dict) and "code" in detail:
        return JSONResponse(status_code=exc.status_code, content={"success": False, "error": detail})
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": {"message": str(detail), "code": "ERROR"}},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {"message": "An unexpected error occurred", "code": "INTERNAL_ERROR"},
        },
    )


# ---------- Health ----------

@app.get("/health", tags=["health"])
async def health() -> dict:
    return {
        "success": True,
        "data": {
            "status": "ok",
            "service": "ai-service",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }


app.include_router(ai_router, prefix="/ai", tags=["ai"])
