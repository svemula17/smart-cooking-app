"""Multi-dish cooking coordinator.

Uses Google OR-Tools' CP-SAT solver to compute start times for a set of
recipes such that they all finish at the same target time. The constraint
form keeps the solver useful: as soon as you add real-world limits (max
parallel burners, prep-station conflicts, etc.) the same model extends
naturally — see the comments at the bottom of ``coordinate``.

The current model has one constraint per recipe (``start + total = T``) so
the result is deterministic; CP-SAT is used here to keep the surface area
ready for those future constraints without rewriting the call site.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Iterable, Optional

from ortools.sat.python import cp_model

from app.schemas.ai import (
    CoordinationRecipe,
    CoordinationStep,
    MultiDishResponse,
    StepSchedule,
    TimelineEntry,
)


def _format_clock(base: datetime, minutes_offset: int) -> str:
    return (base + timedelta(minutes=minutes_offset)).strftime("%-I:%M %p")


def _distribute_steps(
    steps: list[CoordinationStep], total_duration: int
) -> list[tuple[int, str]]:
    """Return a list of (offset_minutes, instruction) pairs.

    If steps include explicit ``time_minutes`` we use them as durations and
    cumulate. Otherwise we evenly distribute steps across the total cook time
    so the user gets reasonable interleaving even for stub data.
    """
    if not steps:
        return [(0, "Start cooking")]

    explicit = [s.time_minutes for s in steps if s.time_minutes is not None]
    if len(explicit) == len(steps):
        cursor = 0
        out: list[tuple[int, str]] = []
        for s in steps:
            out.append((cursor, s.instruction))
            cursor += int(s.time_minutes or 0)
        return out

    if len(steps) == 1:
        return [(0, steps[0].instruction)]

    bucket = max(1, total_duration // len(steps))
    return [(i * bucket, s.instruction) for i, s in enumerate(steps)]


class MultiDishCoordinator:
    """Schedules a set of recipes to finish simultaneously."""

    def coordinate(
        self,
        recipes: Iterable[CoordinationRecipe],
        serve_at: Optional[datetime] = None,
    ) -> MultiDishResponse:
        recipes = list(recipes)
        if not recipes:
            raise ValueError("recipes must not be empty")

        durations = {r.id: r.prep_time + r.cook_time for r in recipes}
        max_total = max(durations.values())

        # Build a CP-SAT model. With only the equal-finish constraint the
        # solution is unique, but the framework lets future constraints (max
        # parallel-burner count, prep-step interval clashes) plug in cleanly.
        model = cp_model.CpModel()
        starts: dict[str, cp_model.IntVar] = {
            r.id: model.NewIntVar(0, max_total, f"start_{r.id}") for r in recipes
        }
        for r in recipes:
            model.Add(starts[r.id] + durations[r.id] == max_total)

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 1.0  # plenty for the size we ever see
        status = solver.Solve(model)
        if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            # Should not happen with the current constraints; surface it
            # explicitly rather than silently returning bad data.
            raise RuntimeError(f"CP-SAT solver failed with status {status}")

        # Treat ``serve_at`` as the wall-clock for the finish moment. If the
        # caller doesn't supply one, anchor at "now + max_total" so the
        # display strings still make sense.
        finish = serve_at or (datetime.now() + timedelta(minutes=max_total))
        cooking_start_clock = finish - timedelta(minutes=max_total)

        timeline: dict[str, TimelineEntry] = {}
        for r in recipes:
            start_offset = int(solver.Value(starts[r.id]))
            steps = _distribute_steps(list(r.steps), durations[r.id])
            schedule = [
                StepSchedule(
                    time=_format_clock(cooking_start_clock, start_offset + offset),
                    step=instruction,
                )
                for offset, instruction in steps
            ]
            timeline[r.id] = TimelineEntry(
                recipe_id=r.id,
                recipe_name=r.name,
                start_time_minutes=start_offset,
                start_time_display=_format_clock(cooking_start_clock, start_offset),
                finish_time_display=_format_clock(cooking_start_clock, max_total),
                steps_schedule=schedule,
            )

        return MultiDishResponse(
            timeline=timeline,
            total_time_minutes=max_total,
            finish_time_display=_format_clock(cooking_start_clock, max_total),
        )
