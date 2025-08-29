import pandas as pd
import ta
from typing import List, Dict, Any, Union

# -------- Helpers --------
def _get_series(df: pd.DataFrame, source: str = "close") -> pd.Series:
    source = (source or "close").lower()
    if source not in df.columns:
        # fallback כדי שלא יקרוס אם שולחים מקור שלא קיים
        source = "close"
    return df[source]

# -------- Indicators --------
def calculate_rsi(df: pd.DataFrame, period: int = 14, source: str = "close", **_: Any):
    s = _get_series(df, source)
    df["RSI"] = ta.momentum.RSIIndicator(s, window=period).rsi()
    return df

def calculate_sma(df: pd.DataFrame, period: int = 20, source: str = "close", **_: Any):
    s = _get_series(df, source)
    df["SMA"] = ta.trend.SMAIndicator(s, window=period).sma_indicator()
    return df

def calculate_ema(df: pd.DataFrame, period: int = 20, source: str = "close", **_: Any):
    s = _get_series(df, source)
    df["EMA"] = ta.trend.EMAIndicator(s, window=period).ema_indicator()
    return df

def calculate_macd(
    df: pd.DataFrame,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
    source: str = "close",
    **_: Any,
):
    s = _get_series(df, source)
    macd = ta.trend.MACD(s, window_slow=slow, window_fast=fast, window_sign=signal)
    df["MACD"] = macd.macd()
    df["MACD_SIGNAL"] = macd.macd_signal()
    df["MACD_HIST"] = macd.macd_diff()
    return df

# -------- Dispatcher --------
IndicatorRuleLike = Union[Dict[str, Any], Any]  # Pydantic או dict

def _get_rule_field(rule: IndicatorRuleLike, name: str, default=None):
    # תומך גם ב-Pydantic (תכונות) וגם ב-dict (מפתחות)
    if isinstance(rule, dict):
        return rule.get(name, default)
    return getattr(rule, name, default)

# פונקציה דינמית שמקבלת רשימת חוקים (כניסה או יציאה מאינדיקטור)
def calculate_indicators(df: pd.DataFrame, rules: List[IndicatorRuleLike], timeframe: str):
    """
    df: DataFrame עם OHLC
    rules: רשימת חוקים לכל מניה (יכול להיות Pydantic או dict)
    timeframe: נשמר לשימוש עתידי אם תרצה cross-TF
    """
    indicator_map = {
        "rsi": calculate_rsi,
        "sma": calculate_sma,
        "ema": calculate_ema,
        "macd": calculate_macd,
        # הוסף כאן אינדיקטורים נוספים לפי הצורך
    }

    if not rules:
        return df

    for rule in rules:
        ind_name = _get_rule_field(rule, "indicator")
        params = _get_rule_field(rule, "params", {}) or {}

        if not ind_name:
            continue

        func = indicator_map.get(str(ind_name).lower())
        if func:
            # הפונקציות מקבלות **kwargs ולכן params יכול לכלול source/period/fast/...
            df = func(df, **params)
        else:
            print(f"Indicator {ind_name} not implemented yet.")

    return df

# פונקציה עוטפת ל-exit_conditions: שולפת רק תנאי יציאה מסוג אינדיקטור ומעבירה ל-calculate_indicators
def calculate_exit_indicators(df: pd.DataFrame, exit_conditions: List[Any], timeframe: str):
    indicator_rules = []
    for cond in exit_conditions or []:
        # Pydantic: cond.type / cond.indicator_rule ; dict: cond["type"] / cond["indicator_rule"]
        ctype = cond.type if hasattr(cond, "type") else cond.get("type")
        if ctype == "indicator":
            ir = cond.indicator_rule if hasattr(cond, "indicator_rule") else cond.get("indicator_rule")
            if ir:
                indicator_rules.append(ir)

    return calculate_indicators(df, indicator_rules, timeframe)
