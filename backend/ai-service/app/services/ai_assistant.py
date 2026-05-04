"""LangChain + OpenAI chat assistant.

Two LLM tiers are wired up:
- **Simple** (gpt-3.5-turbo) for routine cooking Q&A — handles ~90% of traffic.
- **Complex** (gpt-4) for the troubleshoot endpoint, which often needs careful
  diagnostic reasoning.

When ``OPENAI_API_KEY`` is absent, the assistant uses a deterministic stub so
the service can be exercised offline and in tests.

Conversation history lives in Redis under ``conversation:{conversation_id}``
with a 24h TTL — long enough to survive a phone-in-the-pocket break, short
enough to bound storage.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Optional, Protocol
from uuid import uuid4

from app.config.redis import RedisProtocol
from app.config.settings import settings
from app.schemas.ai import ChatContext, ConversationTurn
from app.utils.prompts import (
    CHAT_SYSTEM_PROMPT,
    TIPS_SYSTEM_PROMPT,
    TIPS_USER_TEMPLATE,
    TROUBLESHOOT_SYSTEM_PROMPT,
    TROUBLESHOOT_USER_TEMPLATE,
    render_chat_prompt,
)


class LLMResult:
    """Light wrapper for an LLM completion + token accounting."""

    def __init__(self, content: str, tokens_used: int = 0) -> None:
        self.content = content
        self.tokens_used = tokens_used


class LLMClient(Protocol):
    """Pluggable LLM interface — keeps tests free of network and API keys."""

    async def chat(
        self,
        *,
        system: str,
        user: str,
        history: list[dict[str, str]] | None = None,
        complex_task: bool = False,
    ) -> LLMResult: ...


# ============================================================================
# Real OpenAI-backed client (used when OPENAI_API_KEY is set)
# ============================================================================


class OpenAIClient:
    """LangChain ChatOpenAI wrapper. Lazily instantiates the underlying chains
    so importing this module doesn't require a key — only first use does."""

    def __init__(self) -> None:
        self._simple = None
        self._complex = None

    def _build(self, model_name: str):
        # Imported lazily to keep import time fast and let tests run without
        # the langchain stack being initialized.
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=model_name,
            temperature=settings.openai_temperature,
            max_tokens=settings.openai_max_tokens,
            openai_api_key=settings.openai_api_key,
        )

    def _llm(self, complex_task: bool):
        if complex_task:
            if self._complex is None:
                self._complex = self._build(settings.gpt_complex_model)
            return self._complex
        if self._simple is None:
            self._simple = self._build(settings.gpt_simple_model)
        return self._simple

    async def chat(
        self,
        *,
        system: str,
        user: str,
        history: list[dict[str, str]] | None = None,
        complex_task: bool = False,
    ) -> LLMResult:
        from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

        messages: list[Any] = [SystemMessage(content=system)]
        for turn in history or []:
            if turn["role"] == "user":
                messages.append(HumanMessage(content=turn["content"]))
            else:
                messages.append(AIMessage(content=turn["content"]))
        messages.append(HumanMessage(content=user))

        llm = self._llm(complex_task)
        ai_message = await llm.ainvoke(messages)
        usage = getattr(ai_message, "response_metadata", {}).get("token_usage", {}) or {}
        tokens = int(usage.get("total_tokens", 0))
        return LLMResult(content=str(ai_message.content), tokens_used=tokens)


# ============================================================================
# Stub client used in dev / tests
# ============================================================================


class StubLLMClient:
    """Deterministic, offline LLM stub. Picks a templated reply based on
    keywords in the question so the assistant returns plausible text without
    a network call."""

    async def chat(
        self,
        *,
        system: str,
        user: str,
        history: list[dict[str, str]] | None = None,
        complex_task: bool = False,
    ) -> LLMResult:
        if "tips" in system.lower():
            payload = json.dumps([
                "Mise en place: prep all ingredients before turning on the stove.",
                "Taste as you go — season in stages, not all at the end.",
                "Rest meat for 5 minutes after cooking to keep juices in.",
                "Use a thermometer rather than guessing doneness.",
                "Read the recipe end-to-end once before starting.",
            ])
            return LLMResult(content=payload, tokens_used=128)

        if "troubleshoot" in system.lower():
            payload = json.dumps([
                {"action": "Reduce heat and stir constantly", "explanation": "Prevents the sauce from breaking or burning while you adjust consistency."},
                {"action": "Add a splash of stock or water", "explanation": "Thins thick sauces without diluting flavor as much as plain water alone."},
                {"action": "Whisk in a teaspoon of butter at the end", "explanation": "Emulsifies the sauce and gives it a smooth, glossy finish."},
            ])
            return LLMResult(content=payload, tokens_used=180)

        # Default chat reply — short, friendly, deterministic.
        last = (user or "").strip().splitlines()[-1] if user else ""
        return LLMResult(
            content=(
                "Sure — here's a tip: " + (last or "keep stirring and taste as you go.") +
                " Adjust seasoning at the end and rest cooked proteins briefly before serving."
            ),
            tokens_used=42,
        )


def default_llm_client() -> LLMClient:
    return OpenAIClient() if settings.has_openai_credentials else StubLLMClient()


# ============================================================================
# CookingAssistant — orchestrates the LLM + Redis-backed history + caching
# ============================================================================


class CookingAssistant:
    """Public API used by the route handlers."""

    def __init__(self, redis: RedisProtocol, llm: Optional[LLMClient] = None) -> None:
        self._redis = redis
        self._llm: LLMClient = llm or default_llm_client()

    # ---------- Chat ----------

    async def ask(
        self,
        *,
        message: str,
        context: Optional[ChatContext],
        conversation_id: Optional[str],
    ) -> tuple[str, str, int, bool]:
        """Returns (response, conversation_id, tokens_used, cache_hit)."""

        cid = conversation_id or str(uuid4())
        ctx_dict = context.model_dump() if context else None

        # Try cache for simple, context-free questions — saves tokens on the
        # 90% of FAQ-style queries.
        cache_key = self._cache_key(message)
        if not ctx_dict and cache_key:
            cached = await self._redis.get(cache_key)
            if cached:
                await self._save_turn(cid, "user", message)
                await self._save_turn(cid, "assistant", cached)
                return cached, cid, 0, True

        history = await self._load_history(cid)
        prompt = render_chat_prompt(message, ctx_dict)
        result = await self._llm.chat(
            system=CHAT_SYSTEM_PROMPT,
            user=prompt,
            history=[{"role": h.role, "content": h.content} for h in history],
        )

        await self._save_turn(cid, "user", message)
        await self._save_turn(cid, "assistant", result.content)
        if cache_key and not ctx_dict:
            await self._redis.set(cache_key, result.content, ex=settings.prompt_cache_ttl_seconds)

        return result.content, cid, result.tokens_used, False

    # ---------- Troubleshoot ----------

    async def troubleshoot(self, problem: str, recipe_context: Optional[str]) -> tuple[list[dict], int]:
        result = await self._llm.chat(
            system=TROUBLESHOOT_SYSTEM_PROMPT,
            user=TROUBLESHOOT_USER_TEMPLATE.format(
                problem=problem,
                recipe_context=recipe_context or "(none)",
            ),
            complex_task=True,
        )
        solutions = self._parse_json_solutions(result.content)
        return solutions, result.tokens_used

    # ---------- Tips ----------

    async def tips(self, *, recipe_name: str, cuisine_type: str, difficulty: str, total_minutes: int) -> tuple[list[str], bool]:
        cache_key = f"ai:tips:{recipe_name.lower()}:{cuisine_type.lower()}"
        cached = await self._redis.get(cache_key)
        if cached:
            return json.loads(cached), True

        result = await self._llm.chat(
            system=TIPS_SYSTEM_PROMPT,
            user=TIPS_USER_TEMPLATE.format(
                recipe_name=recipe_name,
                cuisine_type=cuisine_type,
                difficulty=difficulty,
                total_minutes=total_minutes,
            ),
        )
        tips = self._parse_json_strings(result.content)
        await self._redis.set(cache_key, json.dumps(tips), ex=settings.prompt_cache_ttl_seconds)
        return tips, False

    # ---------- Conversation history (Redis) ----------

    @staticmethod
    def _conversation_key(conversation_id: str) -> str:
        return f"conversation:{conversation_id}"

    async def _load_history(self, conversation_id: str) -> list[ConversationTurn]:
        raw = await self._redis.get(self._conversation_key(conversation_id))
        if not raw:
            return []
        try:
            data = json.loads(raw)
            return [ConversationTurn(**turn) for turn in data]
        except (json.JSONDecodeError, ValueError):
            return []

    async def _save_turn(self, conversation_id: str, role: str, content: str) -> None:
        history = await self._load_history(conversation_id)
        history.append(
            ConversationTurn(role=role, content=content, timestamp=datetime.now(timezone.utc).isoformat())
        )
        # Cap at 20 turns to keep prompts (and Redis values) bounded.
        history = history[-20:]
        payload = json.dumps([t.model_dump() for t in history])
        await self._redis.set(
            self._conversation_key(conversation_id),
            payload,
            ex=settings.conversation_ttl_seconds,
        )

    # ---------- Cache key helpers ----------

    @staticmethod
    def _cache_key(message: str) -> Optional[str]:
        normalized = " ".join(message.lower().split())
        if len(normalized) > 200:
            return None  # don't cache long, likely-unique queries
        return f"ai:chat:{normalized}"

    # ---------- JSON parsing of LLM output ----------

    @staticmethod
    def _parse_json_solutions(text: str) -> list[dict[str, str]]:
        """Best-effort parse — accepts a JSON array; falls back to a single
        ``action: text`` entry so the user always sees something."""
        try:
            data = json.loads(text)
            if isinstance(data, list):
                return [
                    {"action": str(item.get("action", "")), "explanation": str(item.get("explanation", ""))}
                    for item in data
                    if isinstance(item, dict)
                ]
        except (json.JSONDecodeError, ValueError):
            pass
        return [{"action": text.strip(), "explanation": ""}]

    @staticmethod
    def _parse_json_strings(text: str) -> list[str]:
        try:
            data = json.loads(text)
            if isinstance(data, list):
                return [str(item) for item in data]
        except (json.JSONDecodeError, ValueError):
            pass
        return [line.strip("-• ") for line in text.splitlines() if line.strip()]
