import os
from typing import Optional, List
  
class Settings:
    FINNHUB_API_KEY: Optional[str] = os.getenv("FINNHUB_API_KEY")
    ALLOW_ORIGINS: List[str] = [
        os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
        "http://localhost:3000",
        "*",
    ]

settings = Settings()
