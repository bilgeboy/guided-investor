import pandas as pd
from typing import List
from ..models import IndicatorRule  # הנח שיש לך את המודל הזה

def check_entry_conditions(df: pd.DataFrame, entry_rules: List[IndicatorRule]) -> pd.Series:
    """
    עבור כל נר ב-DataFrame, בודק אם מתקיימים תנאי הכניסה.
    מחזיר pd.Series של True/False.
    """
    if df.empty or not entry_rules:
        return pd.Series([False] * len(df), index=df.index)

    result = pd.Series(True, index=df.index)  # נניח שכל החוקים צריכים להתקיים (AND)

    for rule in entry_rules:
        ind_name = rule.indicator.upper()
        op = rule.operator
        value = rule.value

        # סדרת השוואה – אם value לא מוגדר משווים ל-close
        series = df[ind_name]
        # TODO: CAPITAL LETTERS THATS probably the problem
        comp_series = df["close"] if (value is None or value is False or (isinstance(value, (int, float)) and value <= 0)) else pd.Series([value]*len(df), index=df.index)

        if op == ">":
            mask = series > comp_series
        elif op == "<":
            mask = series < comp_series
        elif op == ">=":
            mask = series >= comp_series
        elif op == "<=":
            mask = series <= comp_series
        elif op == "crossesAbove":
            mask = series.shift(1) <= comp_series.shift(1)
            mask &= series > comp_series
        elif op == "crossesBelow":
            mask = series.shift(1) >= comp_series.shift(1)
            mask &= series < comp_series
        else:
            mask = pd.Series([False] * len(df), index=df.index)

        result &= mask

    df["entry_signal"] = result

    return df