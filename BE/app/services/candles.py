from collections import defaultdict

CANDLES = defaultdict(list)  # symbol -> list[dict]

def minute_bucket(ts_ms: int) -> int:
    return ts_ms // 60000

def add_tick(symbol: str, price: float, ts_ms: int) -> None:
    mb = minute_bucket(ts_ms)
    series = CANDLES[symbol]
    if not series or series[-1]["minute"] != mb:
        series.append({"minute": mb, "ts": ts_ms, "open": price, "high": price, "low": price, "close": price, "volume": 0})
        if len(series) > 1000:
            CANDLES[symbol] = series[-1000:]
    else:
        c = series[-1]
        c["high"]  = max(c["high"], price)
        c["low"]   = min(c["low"], price)
        c["close"] = price

def get_candles(symbol: str):
    return CANDLES[symbol]
