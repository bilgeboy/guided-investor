import os, json, asyncio, websockets
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
from ..settings import settings
from ..routers.strategies import STRATS
from ..services.candles import add_tick, get_candles
from ..services.indicatiors import compute_indicators, decide
from typing import Optional

FINNHUB_KEY = settings.FINNHUB_API_KEY

async def stream_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        qp = ws.query_params
        symbol = qp.get("symbol", "AAPL")
        strat_id = qp.get("strategy_id")

        await ws.send_json({"type":"info","msg":f"connected for {symbol} (strategy {strat_id})"})

        if not FINNHUB_KEY:
            # Mock generator אם אין מפתח
            price = 100.0
            while True:
                price += (0.5 - (int.from_bytes(os.urandom(1), "big")/255)) * 0.6
                ts = int(datetime.utcnow().timestamp() * 1000)
                await process_tick_and_emit(ws, symbol, price, ts, strat_id)
                await asyncio.sleep(1.0)
        else:
            url = f"wss://ws.finnhub.io?token={FINNHUB_KEY}"
            async with websockets.connect(url, ping_interval=15) as fws:
                await fws.send(json.dumps({"type":"subscribe","symbol":symbol}))
                while True:
                    raw = await fws.recv()
                    data = json.loads(raw)
                    if data.get("type") == "trade":
                        for t in data.get("data", []):
                            await process_tick_and_emit(ws, t["s"], float(t["p"]), int(t["t"]), strat_id)
    except WebSocketDisconnect:
        return
    except Exception as e:
        try:
            await ws.send_json({"type":"error","error":str(e)})
        except:
            pass

async def process_tick_and_emit(ws: WebSocket, symbol: str, price: float, ts_ms: int, strat_id: Optional[str]):
    add_tick(symbol, price, ts_ms)
    candles = get_candles(symbol)
    ind = compute_indicators(candles)
    rules = (STRATS.get(strat_id) or {}).get("rules", [])
    decision, reason = decide(rules, price, ind)

    await ws.send_json({
        "type":"tick",
        "symbol": symbol,
        "price": price,
        "ts": ts_ms,
        **ind,
        "decision": decision,
        "reason": reason,
    })
