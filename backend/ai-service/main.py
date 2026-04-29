from fastapi import FastAPI
from pydantic import BaseModel
from app.ai_assistant import AIAssistant
from app.multi_dish_coordinator import MultiDishCoordinator
from app.variety_algorithm import suggest_variety

app = FastAPI(title="ai-service", version="0.1.0")
assistant = AIAssistant()
coordinator = MultiDishCoordinator()


class ChatRequest(BaseModel):
    message: str
    user_id: str | None = None


class ChatResponse(BaseModel):
    reply: str


class CoordinateRequest(BaseModel):
    recipe_ids: list[str]
    serve_at_minutes_from_now: int = 60


class VarietyRequest(BaseModel):
    user_id: str
    recent_recipe_ids: list[str]
    count: int = 5


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-service"}


@app.post("/ai/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    reply = await assistant.respond(req.message, user_id=req.user_id)
    return ChatResponse(reply=reply)


@app.post("/ai/coordinate")
async def coordinate(req: CoordinateRequest) -> dict:
    return await coordinator.plan(req.recipe_ids, req.serve_at_minutes_from_now)


@app.post("/ai/variety")
async def variety(req: VarietyRequest) -> dict:
    return {"suggestions": suggest_variety(req.recent_recipe_ids, req.count)}
