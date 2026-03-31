from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from tavily import TavilyClient
from dotenv import load_dotenv
from pathlib import Path
import os
import time

# Load env
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

app = FastAPI()

# CORS (important)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tavily
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

# Request schema
class ResearchRequest(BaseModel):
    query: str


@app.get("/health")
def health():
    return {"status": "ok"}


# 🔥 STREAMING ENDPOINT
@app.get("/research-stream")
def research_stream(query: str):

    def generate():
        try:
            # Step 1: simulate agent steps
            steps = [
                "🔍 Searching web...\n",
                "📊 Analyzing sources...\n",
                "🧠 Extracting insights...\n",
                "✍️ Writing report...\n\n"
            ]

            for step in steps:
                yield f"data: {step}\n\n"
                time.sleep(0.7)

            # Step 2: real search (optional)
            try:
                search_results = tavily.search(query=query, max_results=5)
                sources = search_results.get("results", [])
            except:
                sources = []

            # Step 3: final summary (mock AI)
            final_text = f"""
Research Summary for: {query}

- AI-powered traffic systems are rapidly growing in India
- Government adoption + smart city initiatives increasing
- Key companies: Nayan Technologies, Vehant, Staqu
- Market expected to expand with AI-driven surveillance

Sources:
"""

            # Stream summary typing
            for char in final_text:
                yield f"data: {char}\n\n"
                time.sleep(0.01)

            # Stream sources
            for src in sources:
                line = f"\n• {src.get('title')} ({src.get('url')})\n"
                for char in line:
                    yield f"data: {char}\n\n"
                    time.sleep(0.005)

        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")