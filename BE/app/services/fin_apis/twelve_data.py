import asyncio
from datetime import datetime, timedelta
from typing import List, Dict
import httpx
import pandas as pd
import time
import json
from pathlib import Path

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

# --- פונקציה שמקבלת DataFrame ומייצאת JSON לקובץ עם ערך דיפולטיבי ---
def df_to_json_file(df: pd.DataFrame, file_path: str = "data/ohlc.json"):
    """
    Convert DataFrame to JSON and save to file.
    Converts datetime index to ISO strings to avoid JSON serialization errors.
    """
    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    df_copy = df.copy()
    if df_copy.index.name == "datetime" or isinstance(df_copy.index, pd.DatetimeIndex):
        df_copy = df_copy.reset_index()
        df_copy["datetime"] = df_copy["datetime"].dt.strftime("%Y-%m-%d %H:%M:%S")

    json_data = df_copy.to_dict(orient="records")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    
    print(f"Saved JSON to {path}")
    return json_data

def json_file_to_df(file_path: str = "data/ohlc.json") -> pd.DataFrame:
    """
    Load JSON file and return a DataFrame with correct types.
    Converts 'datetime' strings back to pd.Timestamp and numeric columns to float.
    """
    path = Path(file_path)
    if not path.exists():
        print(f"File {file_path} does not exist.")
        return pd.DataFrame()

    with open(path, "r", encoding="utf-8") as f:
        json_data = json.load(f)

    if not json_data:
        return pd.DataFrame()

    df = pd.DataFrame(json_data)

    # אם יש עמודת datetime, המר למשתנה index מסוג Timestamp
    if "datetime" in df.columns:
        df["datetime"] = pd.to_datetime(df["datetime"])
        df = df.set_index("datetime")

    # המר את העמודות המספריות ל-float כדי לשחזר את ה-DF המקורי
    for col in ["open", "high", "low", "close", "volume"]:
        if col in df.columns:
            df[col] = df[col].astype(float)

    return df


async def fetch_ohlc_twelve_data_5000(symbol: str, interval: str, start_date: str):
    """
    Fetch OHLC data from Twelve Data API in batches of 5000 candles each,
    from 'now' backwards to 'start_date', with try-except for error handling.
    """
    interval_map = {
        "1m": "1min", "5m": "5min", "15m": "15min", "60m": "1h",
        "1h": "1h", "1d": "1D", "1w": "1W", "1M": "1M"
    }
    td_interval = interval_map.get(interval, "1min")
    start_dt = pd.to_datetime(start_date)
    end_dt = datetime.utcnow()  # נתחיל מהתאריך הכי עדכני

    all_data = []

    async with httpx.AsyncClient(timeout=30) as client:
        while end_dt > start_dt:
            params = {
                "symbol": symbol,
                "interval": td_interval,
                "apikey": TWELVE_DATA_API_KEY,
                "start_date": start_dt.isoformat(),   # <-- מגביל את תחילת המשיכה
                "end_date": end_dt.isoformat(),
                "outputsize": 5000,
                "format": "JSON"
            }

            try:
                r = await client.get("https://api.twelvedata.com/time_series", params=params)
                r.raise_for_status()
                data = r.json()
            except httpx.HTTPStatusError as e:
                print(f"HTTP error fetching {symbol}: {e}")
                break
            except httpx.RequestError as e:
                print(f"Request error fetching {symbol}: {e}")
                break
            except Exception as e:
                print(f"Unexpected error fetching {symbol}: {e}")
                break

            if "values" not in data or not data["values"]:
                print(f"No more data returned for {symbol}")
                break

            try:
                batch_df = pd.DataFrame(data["values"])
                batch_df = batch_df.rename(columns={
                    "datetime": "datetime",
                    "open": "open",
                    "high": "high",
                    "low": "low",
                    "close": "close",
                    "volume": "volume"
                })
                batch_df = batch_df.astype({
                    "open": float, "high": float, "low": float,
                    "close": float, "volume": float
                })
                batch_df["datetime"] = pd.to_datetime(batch_df["datetime"])
                batch_df = batch_df.set_index("datetime").sort_index()
            except Exception as e:
                print(f"Error processing batch data for {symbol}: {e}")
                break

            all_data.append(batch_df)

            # עדכן את end_dt לפי הנר הכי קדום שהוחזר פחות יחידת זמן אחת
            first_candle_dt = batch_df.index.min()
            if first_candle_dt <= start_dt:
                break
            delta_map = {
                "1min": timedelta(minutes=1),
                "5m": timedelta(minutes=5),
                "15m": timedelta(minutes=15),
                "60m": timedelta(hours=1),
                "1h": timedelta(hours=1),
                "1d": timedelta(days=1),
                "1w": timedelta(weeks=1),
                "1M": timedelta(days=30)  # בערך חודש
            }
            delta = delta_map.get(interval, timedelta(minutes=1))
            end_dt = first_candle_dt - delta

    if all_data:
        full_df = pd.concat(all_data).sort_index()
        full_df = full_df[full_df.index >= start_dt]
        # df_to_json_file(full_df)
        return full_df
    else:
        return pd.DataFrame()