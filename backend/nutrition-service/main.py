"""Nutrition service entry point.

Wires up the FastAPI app, configures the asyncpg pool lifecycle, and exposes
``/health`` plus the ``/nutrition`` router.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.database import Database
from app.config.settings import settings
from app.routes.nutrition import router as nutrition_router
from app.services.nutritionix_service import nutritionix_service


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
