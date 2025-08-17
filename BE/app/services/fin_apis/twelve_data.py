import asyncio
from datetime import datetime, timedelta
from typing import List, Dict
import httpx
import pandas as pd
import time

from app.settings import settings

TWELVE_DATA_API_KEY = settings.TWELVE_DATA_API_KEY  # או API Key שלך ל-Twelve Data

async def fetch_ohlc_twelve_data(symbol: str, interval: str, start_date: str):
    """
    Fetch OHLC data from Twelve Data API.
    interval: '1min', '5min', '15min', '1h', '1D', '1W', '1M'
    start_date: YYYY-MM-DD
    """
    # מיפוי Interval ל-Twelve Data format
    interval_map = {
        "1m": "1min", "5m": "5min", "15m": "15min", "60m": "1h",
        "1h": "1h", "1d": "1D", "1w": "1W", "1M": "1M"
    }
    td_interval = interval_map.get(interval, "1min")
    start_iso = pd.to_datetime(start_date).isoformat()

    url = "https://api.twelvedata.com/time_series"
    params = {
        "symbol": symbol,
        "interval": td_interval,
        "apikey": TWELVE_DATA_API_KEY,
        "start_date": start_iso,
        "format": "JSON"
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()

        if "values" not in data:
            print(f"No data for {symbol}, response: {data}")
            return pd.DataFrame()

        df = pd.DataFrame(data["values"])
        df = df.rename(columns={
            "datetime": "datetime",
            "open": "open",
            "high": "high",
            "low": "low",
            "close": "close",
            "volume": "volume"
        })
        df = df.astype({
            "open": float, "high": float, "low": float,
            "close": float, "volume": float
        })
        df["datetime"] = pd.to_datetime(df["datetime"])
        df = df.set_index("datetime").sort_index()
        df = df[df.index >= pd.to_datetime(start_date)]
        return df

    except httpx.HTTPStatusError as e:
        print(f"HTTP error fetching {symbol}: {e}")
    except httpx.RequestError as e:
        print(f"Request error fetching {symbol}: {e}")
    except Exception as e:
        print(f"Unexpected error fetching {symbol}: {e}")

    return pd.DataFrame()
