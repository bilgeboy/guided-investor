import pandas as pd
from ta.momentum import RSIIndicator
from ta.trend import MACD, SMAIndicator

def compute_indicators(candles: list[dict]) -> dict:
    out = {"rsi": None, "macd": None, "signal": None, "hist": None, "sma50": None}
    if not candles:
        return out
    df = pd.DataFrame(candles)
    close = df["close"]
    try:
        out["rsi"] = float(RSIIndicator(close=close, window=14).rsi().iloc[-1])
    except Exception:
        pass
    try:
        macd = MACD(close=close, window_slow=26, window_fast=12, window_sign=9)
        out["macd"]   = float(macd.macd().iloc[-1])
        out["signal"] = float(macd.macd_signal().iloc[-1])
        out["hist"]   = float(macd.macd_diff().iloc[-1])
    except Exception:
        pass
    try:
        out["sma50"] = float(SMAIndicator(close=close, window=50).sma_indicator().iloc[-1])
    except Exception:
        pass
    return out

def decide(rules: list[dict], price: float, ind: dict) -> tuple[str, str]:
    """מנוע חוקים מינימלי: תואם ל-RuleBuilder הבסיסי"""
    decision, reason = "hold", ""
    rsi = ind.get("rsi")
    macd = ind.get("macd"); signal = ind.get("signal")
    sma50 = ind.get("sma50")
    for r in rules or []:
        ind_name = r.get("indicator")
        op = r.get("operator")
        val = r.get("value")

        if ind_name == "rsi" and rsi is not None and val is not None:
            if op in ["<", "<="] and ((op == "<" and rsi < val) or (op == "<=" and rsi <= val)):
                return "buy", f"RSI {rsi:.1f} {op} {val}"
            if op in [">", ">="] and ((op == ">" and rsi > val) or (op == ">=" and rsi >= val)):
                return "sell", f"RSI {rsi:.1f} {op} {val}"

        if ind_name == "macd" and macd is not None and signal is not None:
            if op == "crossesAbove" and macd > signal:   return "buy",  "MACD crossed above signal"
            if op == "crossesBelow" and macd < signal:   return "sell", "MACD crossed below signal"

        if ind_name == "sma" and sma50 is not None:
            cmp_to = r.get("compareTo", "price")
            if cmp_to == "price":
                if op in [">", ">="] and ((op == ">" and price > sma50) or (op == ">=" and price >= sma50)):
                    return "buy", "Price > SMA50"
                if op in ["<", "<="] and ((op == "<" and price < sma50) or (op == "<=" and price <= sma50)):
                    return "sell", "Price < SMA50"

    return decision, reason
