import pandas as pd
import ta  # ספריית TA-Lib חיצונית לחישוב אינדיקטורים
from typing import List, Dict, Any

# כל אינדיקטור הוא פונקציה שמקבלת df ופרמטרים
# TODO: add more indicators from ta and make the wondow and the df parameters dynamic
# TODO: CHECK FOR OTHER FUNDAMENTAL INDICATORS LIKE ANALYST RECOMMENDATIONS AND EARNINGS SURPRISES AND IMPLEMENT THEM HERE
def calculate_rsi(df: pd.DataFrame, period: int = 14):
    df["RSI"] = ta.momentum.RSIIndicator(df["close"], window=14).rsi()
    return df

def calculate_sma(df: pd.DataFrame, period: int = 20):
    df["SMA"] = ta.trend.SMAIndicator(df["close"], window=20).sma_indicator()
    return df

def calculate_ema(df: pd.DataFrame, period: int = 20):
    df["EMA"] = ta.trend.EMAIndicator(df["close"], window=20).ema_indicator()
    return df

def calculate_macd(df: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9):
    macd = ta.trend.MACD(df["close"], window_slow=slow, window_fast=fast, window_sign=signal)
    df["MACD"] = macd.macd()
    df["MACD_SIGNAL"] = macd.macd_signal()
    df["MACD_HIST"] = macd.macd_diff()
    return df

# פונקציה דינמית שמקבלת רשימת חוקים
def calculate_indicators(df: pd.DataFrame, entry_rules: List[Dict[str, Any]], timeframe: str):
    """
    df: DataFrame עם OHLC
    entry_rules: רשימת חוקים לכל מניה
    timeframe: כרגע נשמר אך יכול לשמש בעת חישוב חיתוכים בין טיימפריימים
    """
    # מיפוי אינדיקטורים לפונקציות
    indicator_map = {
        "rsi": calculate_rsi,
        "sma": calculate_sma,
        "ema": calculate_ema,
        "macd": calculate_macd,
        # ניתן להוסיף עוד אינדיקטורים
    }

    for rule in entry_rules:
        ind_name = rule.indicator
        params = rule.params or {}

        func = indicator_map.get(ind_name.lower())
        if func:
            df = func(df, **params)
        else:
            print(f"Indicator {ind_name} not implemented yet.")

    return df

# פונקציה עוטפת רק ל-exit_conditions
def calculate_exit_indicators(df: pd.DataFrame, exit_conditions: List[Dict[str, Any]], timeframe: str):
    """
    שולף רק exit_conditions מסוג indicator
    ומעביר לפונקציה הראשית את ה-indicator_rule
    """
    # indicator_rules = [
    #     cond["indicator_rule"]
    #     for cond in exit_conditions
    #     if cond.type == "indicator" and "indicator_rule" in list(cond.model_fields.keys()) and cond.indicator_rule is not None
    # ]
    indicator_rules=[]
    for cond in exit_conditions:
        if cond.type == "indicator" and "indicator_rule" in list(cond.model_fields.keys()) and cond.indicator_rule != None:
            indicator_rules.append(cond.indicator_rule)

    return calculate_indicators(df, indicator_rules, timeframe)