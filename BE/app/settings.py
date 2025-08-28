import os
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()
class Settings:
    FINNHUB_API_KEY: Optional[str] = os.getenv("FINNHUB_API_KEY")
    ALPHA_API_KEY: Optional[str] = os.getenv("ALPHA_API_KEY")
    TWELVE_DATA_API_KEY: Optional[str] = os.getenv("TWELVE_DATA_API_KEY")
    ALLOW_ORIGINS: List[str] = [
        os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
        "http://localhost:3000",
        "*",
    ]
    # AI
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "groq")  # groq | openrouter | ollama
    AI_ENDPOINT: str = os.getenv("AI_ENDPOINT", "https://api.groq.com/openai/v1/chat/completions")
    AI_MODEL: str = os.getenv("AI_MODEL", "llama3-8b-8192")
    AI_API_KEY: str = os.getenv("AI_API_KEY")

    OLLAMA_ENDPOINT: str = os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434/api/generate")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.1:8b")

    # MongoDB
    MONGO_USER: Optional[str] = os.getenv("MONGO_USER")
    MONGO_PASSWORD: Optional[str] = os.getenv("MONGO_PASSWORD")
    MONGO_CLUSTER: Optional[str] = os.getenv("MONGO_CLUSTER")
    MONGO_DB: Optional[str] = os.getenv("MONGO_DB", "ai_trading")

    @property
    def MONGO_URI(self) -> str:
        return f"mongodb+srv://{self.MONGO_USER}:{self.MONGO_PASSWORD}@{self.MONGO_CLUSTER}/{self.MONGO_DB}?retryWrites=true&w=majority"

settings = Settings()
