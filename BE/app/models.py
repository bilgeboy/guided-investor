from pydantic import BaseModel
from typing import Any, List, Optional

class Strategy(BaseModel):
    id: str
    symbol: str
    rules: List[dict]  # מגיע מה-RuleBuilder בפרונט
    amount: float
    maxLoss: float

class StrategyCreateResponse(BaseModel):
    ok: bool
    id: str

class TickOut(BaseModel):
    type: str = "tick"
    symbol: str
    price: float
    ts: int
    rsi: Optional[float] = None
    macd: Optional[float] = None
    signal: Optional[float] = None
    hist: Optional[float] = None
    sma50: Optional[float] = None
    decision: str = "hold"
    reason: str = ""
