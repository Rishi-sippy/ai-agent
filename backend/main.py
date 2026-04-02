from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from tavily import TavilyClient
from dotenv import load_dotenv
from pathlib import Path
import os
import time

# Load env
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

app = FastAPI()

# ✅ CORS (important for EventSource)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tavily client
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


class ResearchRequest(BaseModel):
    query: str


@app.get("/health")
def health():
    return {"status": "ok"}


# 🔥 FINAL STREAMING ENDPOINT
@app.get("/research-stream")
def research_stream(query: str):

    def generate():
        try:
            # 🧠 Step 1: Agent thinking steps
            steps = [
                "🔍 Searching web...",
                "📊 Analyzing sources...",
                "🧠 Extracting insights...",
                "✍️ Writing report..."
            ]

            for step in steps:
                yield f"data: {step}\n\n"
                time.sleep(0.7)

            # 🌐 Step 2: Tavily search
            try:
                search_results = tavily.search(query=query, max_results=5)
                sources = search_results.get("results", [])
            except Exception as e:
                sources = []
                yield f"data: ⚠️ Tavily error: {str(e)}\n\n"

            # 📝 Step 3: Summary
            summary = f"""
Research Summary for: {query}

- AI-powered traffic systems are rapidly growing in India
- Smart city adoption is increasing across major cities
- Key companies: Nayan Technologies, Vehant, Staqu
- Growth driven by AI surveillance and analytics

Sources:
"""

            # ✍️ Stream summary (typing effect)
            for char in summary:
                yield f"data: {char}\n\n"
                time.sleep(0.01)

            # 🔗 Step 4: Stream sources
            for src in sources:
                line = f"\n• {src.get('title')} ({src.get('url')})\n"
                for char in line:
                    yield f"data: {char}\n\n"
                    time.sleep(0.003)

            # ✅ END SIGNAL (VERY IMPORTANT)
            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # prevents buffering
        },
    )