from uuid import uuid4
from app.models.schemas import LogEntry

# In-memory store; swap for SQLAlchemy in production.
_LOGS: dict[str, list[LogEntry]] = {}


async def create_log(entry: LogEntry) -> LogEntry:
    if entry.id is None:
        entry.id = str(uuid4())
    _LOGS.setdefault(entry.user_id, []).append(entry)
    return entry


async def list_logs_for_user(user_id: str) -> list[LogEntry]:
    return _LOGS.get(user_id, [])
