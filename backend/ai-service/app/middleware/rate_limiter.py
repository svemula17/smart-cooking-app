"""Per-user daily AI rate limiting backed by Redis.

Free tier: ``FREE_TIER_DAILY_LIMIT`` requests per UTC day (default 5).
Premium tier: unlimited.

Counters use a key shape of ``ai:usage:{user_id}:{YYYY-MM-DD}`` and are TTL'd
to ~25 hours so they auto-evict the day after.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.config.redis import RedisProtocol
from app.config.settings import settings


def _today_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def usage_key(user_id: str) -> str:
    return f"ai:usage:{user_id}:{_today_utc()}"


async def consume_quota(redis: RedisProtocol, *, user_id: str, is_premium: bool) -> int:
    """Atomically increment the daily counter, refresh the TTL on first use,
    and 429 if the free-tier limit has already been reached.

    Returns the post-increment count for caller logging.
    """
    if is_premium:
        return 0

    key = usage_key(user_id)
    count = await redis.incr(key)
    if count == 1:
        # First usage today — set TTL slightly longer than 24h to give some
        # slack across daylight-saving-style edge cases.
        await redis.expire(key, 25 * 60 * 60)

    if count > settings.free_tier_daily_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": (
                    f"Daily AI quota of {settings.free_tier_daily_limit} reached. "
                    "Upgrade to premium for unlimited access."
                ),
                "code": "RATE_LIMITED",
                "details": {"used": count, "limit": settings.free_tier_daily_limit},
            },
        )
    return count
