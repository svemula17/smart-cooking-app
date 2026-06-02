"""Receipt OCR via OpenAI Vision (gpt-4o / gpt-4o-mini).

When OPENAI_API_KEY isn't configured the parser returns an empty result
with ``parser_available=False`` so the mobile UI can transparently fall
back to manual entry.

Keeping this in its own module (separate from ai_assistant.py) makes the
no-key fallback path easy to read and avoids pulling vision deps into
the chat path.
"""

from __future__ import annotations

import json
import re
from typing import Any

from app.config.settings import settings
from app.schemas.ai import ParseReceiptResponse, ReceiptItem


# The model is asked to return ONLY JSON of this shape. We instruct it to
# leave fields null when uncertain rather than hallucinate.
_PROMPT = (
    "You are a receipt OCR assistant. Look at the receipt image and return "
    "a JSON object describing the line items. Return ONLY JSON, no prose, "
    "no markdown code fences.\n\n"
    "Schema:\n"
    "{\n"
    '  "store": string|null,         // e.g. "Walmart", "Whole Foods"\n'
    '  "purchase_date": "YYYY-MM-DD"|null,\n'
    '  "total": number|null,         // grand total in the currency on the receipt\n'
    '  "items": [\n'
    "    {\n"
    '      "name": string,           // human-friendly ingredient name, e.g. "tomatoes" not "TOMATO 12CT"\n'
    '      "quantity": number|null,  // numeric quantity if printed, else null\n'
    '      "unit": string|null,      // "lb", "oz", "kg", "g", "unit", "pack" — null if uncertain\n'
    '      "price": number|null      // total line price (qty × unit price)\n'
    "    }\n"
    "  ]\n"
    "}\n\n"
    "Skip non-food bookkeeping lines (subtotal, tax, change due, tender). "
    "Skip non-grocery items (cigarettes, batteries). When the receipt is "
    "blurry or partially visible, include only items you can read with "
    "high confidence."
)


def _strip_data_url(b64: str) -> str:
    """Allow either raw base64 or a data URL prefix."""
    if "," in b64 and b64.startswith("data:"):
        return b64.split(",", 1)[1]
    return b64


def _extract_json(text: str) -> dict[str, Any]:
    """Robust JSON extraction — LLMs sometimes wrap in ```json fences even
    when told not to."""
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*(.+?)\s*```", text, re.DOTALL)
    if fence:
        text = fence.group(1)
    return json.loads(text)


async def parse_receipt(image_base64: str) -> ParseReceiptResponse:
    if not settings.openai_api_key:
        # Graceful no-key fallback. Mobile shows "Add items manually".
        return ParseReceiptResponse(items=[], parser_available=False)

    cleaned = _strip_data_url(image_base64)

    try:
        # Use the official OpenAI client directly for vision — langchain's
        # vision API is a bit awkward and we don't need conversation memory.
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.openai_api_key)
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",  # cheap + multimodal; ~$0.0025/image for receipts
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": _PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{cleaned}",
                                "detail": "high",
                            },
                        },
                    ],
                }
            ],
            max_tokens=1500,
            temperature=0.1,
        )
        content = resp.choices[0].message.content or ""
        tokens = resp.usage.total_tokens if resp.usage else 0
        data = _extract_json(content)

        items = [
            ReceiptItem(
                name=str(it.get("name", "")).strip(),
                quantity=_coerce_float(it.get("quantity")),
                unit=_coerce_str(it.get("unit")),
                price=_coerce_float(it.get("price")),
            )
            for it in (data.get("items") or [])
            if str(it.get("name", "")).strip()
        ]
        return ParseReceiptResponse(
            items=items,
            store=_coerce_str(data.get("store")),
            total=_coerce_float(data.get("total")),
            purchase_date=_coerce_str(data.get("purchase_date")),
            parser_available=True,
            tokens_used=tokens,
        )
    except Exception:
        # Any failure (network, JSON parse, OpenAI error) → fall through to
        # manual entry. The caller logs separately if needed.
        return ParseReceiptResponse(items=[], parser_available=False)


def _coerce_float(v: Any) -> float | None:
    if v is None or v == "":
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _coerce_str(v: Any) -> str | None:
    if v is None:
        return None
    s = str(v).strip()
    return s or None
