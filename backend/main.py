from fastapi import FastAPI
from pydantic import BaseModel
from tavily import TavilyClient
from dotenv import load_dotenv
from pathlib import Path
import os

# ✅ Load env properly
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

app = FastAPI()

# ✅ Initialize Tavily
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

# ✅ Request schema
class ResearchRequest(BaseModel):
    query: str


# ✅ Health check
@app.get("/health")
def health():
    return {"status": "ok"}


# 🚀 MAIN RESEARCH ENDPOINT
@app.post("/research")
def research(data: ResearchRequest):
    try:
        # 🔍 Step 1: Web search
        search_results = tavily.search(
            query=data.query,
            max_results=5
        )

        # 🧠 Step 2: Mock AI summary (FREE MODE)
        summary = f"""
        🔎 Research Summary for: {data.query}

        - This is a simulated AI-generated report.
        - The system successfully fetched real-time web data.
        - Sources are analyzed and structured below.

        👉 You can replace this with OpenAI/Groq later.
        """

        # ✅ Final response
        return {
            "query": data.query,
            "summary": summary.strip(),
            "sources": search_results.get("results", [])
        }

    except Exception as e:
        return {
            "error": str(e)
        }