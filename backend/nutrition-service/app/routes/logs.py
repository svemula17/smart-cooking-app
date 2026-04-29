from fastapi import APIRouter
from app.models.schemas import LogEntry
from app.services.log_repo import create_log, list_logs_for_user

router = APIRouter()


@router.post("/", response_model=LogEntry)
async def create(entry: LogEntry) -> LogEntry:
    return await create_log(entry)


@router.get("/{user_id}", response_model=list[LogEntry])
async def list_for_user(user_id: str) -> list[LogEntry]:
    return await list_logs_for_user(user_id)
