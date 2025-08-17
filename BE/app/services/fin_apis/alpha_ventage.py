import asyncio
from datetime import datetime, timedelta
from typing import List, Dict
import httpx
import pandas as pd
import time

from app.settings import settings

ALPHA_VANTAGE_API = settings.ALPHA_API_KEY  # API Key שלך ל-Alpha Vantage

async def fetch_ohlc_alpha_vantage(symbol: str, interval: str, start_date: str):
    """
    מושך נתוני OHLC מ-Alpha Vantage.
    interval: '1min', '5min', '15min', '60min', 'daily'
    start_date: YYYY-MM-DD
    """
    url = f"https://www.alphavantage.co/query"
    params = {
        "function": "TIME_SERIES_INTRADAY" if interval in ["1min","5min","15min","60min"] else "TIME_SERIES_DAILY",
        "symbol": symbol,
        "interval": interval if interval in ["1min","5min","15min","60min"] else None,
        "apikey": ALPHA_VANTAGE_API,
        "outputsize": "full"
    }
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        data = r.json()
    # נניח שמחזיר מילון {'timestamp': {open, high, low, close}}
    if "Time Series" in data:
        series = list(data.values())[1]  # תלוי בפורמט של Alpha Vantage
        df = pd.DataFrame(series).T.astype(float)
        df.index = pd.to_datetime(df.index)
        df = df[df.index >= pd.to_datetime(start_date)]
        return df
    return pd.DataFrame()