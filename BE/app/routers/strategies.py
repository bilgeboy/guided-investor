from fastapi import APIRouter
from typing import Dict
from ..models import Strategy, StrategyCreateResponse, BacktestRequest
from ..services.backtest import run_backtest

router = APIRouter(tags=["strategies"])

# In-memory store זמני (להחלפה ב-DB בהמשך)
STRATS: Dict[str, dict] = {}

@router.post("/strategies", response_model=StrategyCreateResponse)
def create_strategy(s: Strategy):
    STRATS[s.id] = s.model_dump()
    return {"ok": True, "id": s.id}

@router.get("/strategies/{sid}")
def get_strategy(sid: str):
    return STRATS.get(sid) or {}

@router.post("/strategies-test")
async def backtest(req: BacktestRequest):
    """
    מקבל רשימת מניות עם אינדיקטורים ותנאי כניסה ויציאה
    ומחזיר רשימת עסקאות JSON עם מחיר כניסה/יציאה, כמות ורווח
    """
    results = await run_backtest(req.stocks)
    return {"results": results}
