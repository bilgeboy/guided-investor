from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
import asyncio
from ..routers.strategies import STRATS
from ..services.candles import get_candles
from ..services.indicators import compute_indicators
from ..services.ai import ask_ai_free

router = APIRouter(tags=["run"])
TF_SECONDS = {"1m":60, "5m":300, "15m":900, "1h":3600}

class RunReq(BaseModel):
    strategy_id: str
    symbol: str
    timeframe: str = "1m"
    execution: str = "sim"  # sim/broker – לעתיד

@router.post("/run")
async def run_strategy(req: RunReq, bg: BackgroundTasks):
    bg.add_task(run_loop, req.strategy_id, req.symbol, req.timeframe)
    return {"ok": True}

async def run_loop(sid: str, symbol: str, tf: str):
    period = TF_SECONDS.get(tf, 60)
    while True:
        try:
            candles = get_candles(symbol)
            if not candles:
                await asyncio.sleep(period); continue

            ind = compute_indicators(candles)
            last = candles[-1]
            o,h,l,c = last["open"], last["high"], last["low"], last["close"]
            closes = [x["close"] for x in candles[-50:]]

            strat = STRATS.get(sid) or {}
            rules = strat.get("rules", [])
            amount = strat.get("amount", 1000)
            max_loss = strat.get("maxLoss", 50)

            decision = await ask_ai_free(
                symbol=symbol, tf=tf, o=o,h=h,l=l,c=c,
                ind=ind, closes=closes, rules=rules,
                amount=amount, max_loss=max_loss
            )

            # TODO: אם execution == "sim": paperEngine.on_signal(...)
            # TODO: לשדר ל-Frontend דרך WS או לשמור ליומן הזמנות

        except Exception:
            pass
        await asyncio.sleep(period)
