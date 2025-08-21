import asyncio
from datetime import datetime, timedelta
from typing import List, Dict
import httpx
import pandas as pd
import time

from .fin_apis.twelve_data import fetch_ohlc_twelve_data, fetch_ohlc_twelve_data_5000, json_file_to_df
from .indicators.calc_indicators import calculate_indicators
from .check_entry import check_entry_conditions
from .process_trades import process_trades, summarize_trades
from ..models import StockStrategy, BacktestRequest
from ..settings import settings

ALPHA_VANTAGE_API = settings.FINNHUB_API_KEY  # או API Key שלך ל-Alpha Vantage


async def run_backtest(stocks: List[StockStrategy]):
    results = []

    for stock in stocks:
        start_date = stock.start_date.isoformat() if stock.start_date else "1900-01-01"
        # ohlc = await fetch_ohlc_twelve_data_5000(stock.symbol, stock.timeframe, start_date)
        ohlc = json_file_to_df()
        ohlc = calculate_indicators(ohlc, stock.entry_rules, stock.timeframe)
        ohlc = check_entry_conditions(ohlc, stock.entry_rules)
        ohlc, trades = await process_trades(ohlc, stock)
        
        # TODO: אם נכנס -> צור עסקה buy
        # TODO: בדוק תנאי יציאה -> צור עסקה sell
        # TODO: שמור רווח/הפסד

        summary = summarize_trades(trades, stock.investment)

        results.append({
            "symbol": stock.symbol,
            "trades": trades,
            "summary": summary
        })

        break # TODO: delete it. the json file has NVDA info and it make fail

    return results

# async def run_backtest(stocks: List[StockStrategy]):
#     results = []

#     for stock in stocks:
#         start_date = stock.start_date.isoformat() if stock.start_date else "1900-01-01"
#         ohlc = await fetch_ohlc_alpha_vantage(stock.symbol, stock.timeframe, start_date)

#         # TODO: חשב אינדיקטורים על df (RSI, SMA, EMA וכו.)
#         # TODO: עבור כל שורה של נר, בדוק תנאי כניסה
#         # TODO: אם נכנס -> צור עסקה buy
#         # TODO: בדוק תנאי יציאה -> צור עסקה sell
#         # TODO: שמור רווח/הפסד

#         trades = []  # list של dict לפי דוגמה
#         summary = {"start_capital": stock.investment, "end_capital": stock.investment, "total_profit": 0}

#         results.append({
#             "symbol": stock.symbol,
#             "trades": trades,
#             "summary": summary
#         })

#     return results



