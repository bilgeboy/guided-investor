import pandas as pd
from typing import List, Dict
from ..models import StockStrategy

async def process_trades(ohlc: pd.DataFrame, stock: StockStrategy):
    """
    Process buy/sell trades based on entry_signal and exit_conditions (TP/SL).
    Returns updated DF with in_position, position_type, pnl columns,
    and a list of executed trades.
    """

    if ohlc.empty:
        return ohlc, []

    # הוספת עמודות ל-DF
    ohlc = ohlc.copy()
    ohlc["in_position"] = False
    ohlc["position_type"] = None
    ohlc["pnl"] = 0.0

    trades = []
    in_position = False
    entry_price = 0.0
    shares = 0
    entry_index = None

    # קבלת ערכי יציאה
    sl_or_tp = stock.exit_conditions

    # TODO: בעתיד אפשר להמיר את הערכים לאחוזים אם יגיעו בערך מוחלט או אחוז
    # TODO: בעתיד להוסיף אפשרות SHORT

    for idx, row in ohlc.iterrows():
        price = row["close"]

        # כניסה לעסקה
        if row.get("entry_signal", False) and not in_position:
            in_position = True
            entry_price = price
            shares = stock.investment / price  # TODO: בדוק rounding אם צריך
            entry_index = idx
            ohlc.at[idx, "in_position"] = True
            ohlc.at[idx, "position_type"] = "BUY"
            # TODO: אפשרות להוסיף סוג הוראה (MKT, LMT וכו')
            continue

        # אם בעסקה פעילה
        if in_position:
            pnl = (price - entry_price) * shares
            ohlc.at[idx, "in_position"] = True
            ohlc.at[idx, "position_type"] = "BUY"
            ohlc.at[idx, "pnl"] = pnl

            # בדיקה ל-TP / SL אם קיימים
            exit_flag = False
            for condition in sl_or_tp:  # עבר על כל תנאי יציאה
              ctype = condition.type
              cvalue = condition.value
      
              if ctype == "take_profit" and pnl >= cvalue:
                  exit_flag = True
              elif ctype == "stop_loss" and pnl <= -cvalue:
                  exit_flag = True


            if exit_flag:
                in_position = False
                ohlc.at[idx, "position_type"] = "SELL"
                trades.append({
                    "entry_index": entry_index,
                    "exit_index": idx,
                    "entry_price": entry_price,
                    "exit_price": price,
                    "shares": shares,
                    "pnl": pnl,
                    "pct_return": (pnl / (entry_price * shares)) * 100,
                    "type": "BUY"  # TODO: בעתיד להוסיף אפשרות SHORT
                })
                entry_price = 0.0
                shares = 0
                entry_index = None

    return ohlc, trades

from typing import List, Dict

def summarize_trades(trades: List[Dict], start_capital: float) -> Dict:
    """
    מקבל רשימת trades וחישוב סיכומים:
    - end_capital
    - total_profit
    - number of trades
    - win/loss %
    - avg deal profit (absolute & %)
    - cumulative % gain from start_capital
    """
    summary = {
        "start_capital": start_capital,
        "end_capital": start_capital,
        "total_profit": 0,
        "num_trades": 0,
        "win_rate": 0.0,
        "loss_rate": 0.0,
        "avg_deal_profit": 0.0,
        "avg_deal_profit_pct": 0.0,
        "cumulative_return_pct": 0.0
    }

    if not trades:
        return summary

    num_trades = len(trades)
    wins = [t for t in trades if t["pnl"] > 0]
    losses = [t for t in trades if t["pnl"] <= 0]

    total_profit = sum(t["pnl"] for t in trades)
    avg_profit = total_profit / num_trades if num_trades else 0
    avg_profit_pct = sum(t["pct_return"] for t in trades) / num_trades if num_trades else 0
    win_rate = len(wins) / num_trades * 100
    loss_rate = len(losses) / num_trades * 100
    cumulative_return_pct = (start_capital + total_profit - start_capital) / start_capital * 100

    summary.update({
        "end_capital": start_capital + total_profit,
        "total_profit": total_profit,
        "num_trades": num_trades,
        "win_rate": win_rate,
        "loss_rate": loss_rate,
        "avg_deal_profit": avg_profit,
        "avg_deal_profit_pct": avg_profit_pct,
        "cumulative_return_pct": cumulative_return_pct
    })

    return summary

