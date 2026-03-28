from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from tavily import TavilyClient
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


class ResearchRequest(BaseModel):
    query: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/research")
def research(data: ResearchRequest):
    # Step 1: search web
    search_results = tavily.search(
        query=data.query,
        max_results=5
    )

    # Step 2: summarize with AI
    prompt = f"""
    Research this topic and create an executive summary:
    {data.query}

    Sources:
    {search_results}
    """

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": "You are a senior market research analyst."},
            {"role": "user", "content": prompt},
        ],
    )

    return {
        "query": data.query,
        "summary": response.choices[0].message.content,
        "sources": search_results,
    }