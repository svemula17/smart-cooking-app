from datetime import datetime, timedelta


class MultiDishCoordinator:
    """Schedules multiple dishes so they finish at the same time."""

    async def plan(self, recipe_ids: list[str], serve_at_minutes_from_now: int) -> dict:
        target = datetime.utcnow() + timedelta(minutes=serve_at_minutes_from_now)
        plan = []
        for rid in recipe_ids:
            # Placeholder: assume each dish takes 30 min total. Replace with recipe-service lookup.
            duration = 30
            start_at = target - timedelta(minutes=duration)
            plan.append({
                "recipe_id": rid,
                "start_at": start_at.isoformat(),
                "finish_at": target.isoformat(),
                "estimated_minutes": duration,
            })
        return {"target_serve_at": target.isoformat(), "schedule": plan}
