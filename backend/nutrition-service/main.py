from fastapi import FastAPI
from app.routes import nutrition, logs

app = FastAPI(title="nutrition-service", version="0.1.0")

app.include_router(nutrition.router, prefix="/nutrition", tags=["nutrition"])
app.include_router(logs.router, prefix="/logs", tags=["logs"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "nutrition-service"}
