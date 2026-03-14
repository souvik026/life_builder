import json
from openai import AsyncOpenAI
from config import Settings


class LLMService:
    """Wraps all OpenAI API calls. Never call OpenAI directly from other services."""

    def __init__(self, settings: Settings):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model

    async def call(self, prompt: str, system: str = "", max_tokens: int = 500) -> str:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content

    async def call_json(self, prompt: str, system: str = "") -> dict:
        """Use when you need a structured JSON response."""
        json_system = system + "\n\nReturn ONLY valid JSON. No preamble, no markdown fences."
        raw = await self.call(prompt, json_system, max_tokens=1500)
        return json.loads(raw)
