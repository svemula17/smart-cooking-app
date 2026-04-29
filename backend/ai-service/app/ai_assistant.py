import os
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

SYSTEM_PROMPT = (
    "You are a friendly cooking assistant. Help users with ingredient substitutions, "
    "techniques, dietary adaptations, and meal planning. Keep replies concise."
)


class AIAssistant:
    def __init__(self) -> None:
        self.model = ChatAnthropic(
            model=os.getenv("AI_MODEL", "claude-opus-4-7"),
            api_key=os.getenv("ANTHROPIC_API_KEY"),
            temperature=0.4,
        )

    async def respond(self, message: str, user_id: str | None = None) -> str:
        if not os.getenv("ANTHROPIC_API_KEY"):
            return f"(stub reply) You asked: {message}"
        result = await self.model.ainvoke([
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=message),
        ])
        return str(result.content)
