import asyncio
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

async def test_openai():
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    print(f"Testing OpenAI with key: {api_key[:10]}...")
    
    client = AsyncOpenAI(api_key=api_key)
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Say hello"}],
            max_tokens=5
        )
        print("SUCCESS: OpenAI response:", response.choices[0].message.content)
    except Exception as e:
        print("FAILURE: OpenAI error:", e)

if __name__ == "__main__":
    asyncio.run(test_openai())
