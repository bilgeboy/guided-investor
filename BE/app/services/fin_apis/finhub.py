import asyncio
from datetime import datetime, timedelta
from typing import List, Dict
import httpx
import pandas as pd
import time

from app.settings import settings

FINNHUB_API = settings.FINNHUB_API_KEY  # API Key שלך ל-Finnhub

async def fetch_ohlc_finnhub(symbol: str, interval: str, start_date: str):
    """
    Fetch OHLC data from Finnhub.
    interval: '1m', '5m', '15m', '60m', '1h', '1d', '1w', '1M'
    start_date: YYYY-MM-DD
    """
    resolution_map = {
        "1m": "1", "5m": "5", "15m": "15", "60m": "60",
        "1h": "60", "1d": "D", "1w": "W", "1M": "M"
    }
    resolution = resolution_map.get(interval, "1")
    start_ts = int(pd.Timestamp(start_date).timestamp())
    end_ts = int(datetime.utcnow().timestamp())

    url = "https://finnhub.io/api/v1/stock/candle"
    params = {
        "symbol": symbol,
        "resolution": resolution,
        # "from": start_ts,
        # "to": end_ts,
        "from": int((datetime.utcnow() - timedelta(days=10)).timestamp()),  # 10 ימים אחורה
        "to": end_ts,
        "token": FINNHUB_API
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()

        if data.get("s") != "ok":
            print(f"No data for {symbol}, status: {data.get('s')}")
            return pd.DataFrame()

        df = pd.DataFrame({
            "open": data["o"],
            "high": data["h"],
            "low": data["l"],
            "close": data["c"],
            "volume": data["v"]
        }, index=pd.to_datetime(data["t"], unit='s'))

        df.index.name = "datetime"
        return df

    except httpx.HTTPStatusError as e:
        print(f"HTTP error fetching {symbol}: {e}")
    except httpx.RequestError as e:
        print(f"Request error fetching {symbol}: {e}")
    except Exception as e:
        print(f"Unexpected error fetching {symbol}: {e}")

    return pd.DataFrame()