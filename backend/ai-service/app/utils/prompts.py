"""Prompt templates.

Kept centralized so prompt iteration doesn't require touching service code.
Templates use ``str.format`` rather than f-strings so the same template can be
hot-swapped at runtime without code changes.
"""

from __future__ import annotations

CHAT_SYSTEM_PROMPT = (
    "You are a friendly, concise cooking assistant. "
    "Give actionable, step-by-step advice. Suggest substitutions when ingredients "
    "are missing. Be encouraging without being preachy. Keep replies under 150 words "
    "unless the user explicitly asks for more detail."
)

CHAT_USER_PROMPT_TEMPLATE = """\
Recipe: {recipe_name}
Current step: {current_step}
Available ingredients: {ingredients_available}

User question: {message}
"""

TROUBLESHOOT_SYSTEM_PROMPT = (
    "You are an expert cook helping diagnose problems mid-recipe. "
    "Reply with 2-4 concrete fixes, each with an action and a one-sentence explanation. "
    "Format your reply as a JSON array of {\"action\": ..., \"explanation\": ...} objects."
)

TROUBLESHOOT_USER_TEMPLATE = """\
Problem: {problem}
Recipe context: {recipe_context}
"""

TIPS_SYSTEM_PROMPT = (
    "You are a friendly cooking expert. Given a recipe name and cuisine, return 5 "
    "short, practical tips a home cook would find useful. "
    "Reply as a JSON array of strings, each tip a single sentence."
)

TIPS_USER_TEMPLATE = """\
Recipe: {recipe_name}
Cuisine: {cuisine_type}
Difficulty: {difficulty}
Cooking time: {total_minutes} minutes
"""


def render_chat_prompt(message: str, context: dict | None) -> str:
    """Format the chat prompt with safe defaults when context fields are absent."""
    ctx = context or {}
    return CHAT_USER_PROMPT_TEMPLATE.format(
        recipe_name=ctx.get("recipe_name") or "(not specified)",
        current_step=ctx.get("current_step") or "(not specified)",
        ingredients_available=", ".join(ctx.get("ingredients_available") or []) or "(not specified)",
        message=message,
    )
