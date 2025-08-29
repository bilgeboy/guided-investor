from motor.motor_asyncio import AsyncIOMotorClient
from ..settings import settings
from datetime import datetime
import asyncio
import json
import os
# from pymongo import MongoClient
from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timezone, date
import pandas as pd
import numpy as np

# חיבור ל-MongoDB
client = AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.MONGO_DB]
ohlc_collection = db['ohlc']
print("✅ Connected to MongoDB successfully!")

# פונקציה לבדוק חיבור
async def test_connection():
    try:
        # הפקודה ping שולחת פינג לשרת MongoDB
        result = await db.command("ping")
        if result.get("ok"):
            print("✅ Connected to MongoDB successfully!")
        else:
            print("⚠️ Could not confirm MongoDB connection.")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")

async def test_db():
    # קח דוקומנט אחד מהקולקשן
    doc = await ohlc_collection.find_one()
    if doc:
        print("✅ DB connection successful. Document found:")
        print(doc)
    else:
        print("⚠️ DB connection successful, but no documents found.")

# script_dir = os.path.dirname(__file__)  # תיקיית הסקריפט
# json_path = os.path.join(script_dir, "ohlc.json")

# with open(json_path, "r") as f:
#     ohlc_data = json.load(f)

# document = {
#     "symbol": "AAPL",
#     "timeframe": "1h",
#     "start_date": "2021-01-04",
#     "end_date": "2025-08-19",
#     "ohlc": ohlc_data,   # כאן נכנס כל התוכן של הקובץ
#     "fetched_at": datetime.utcnow().isoformat()
# }

# --- שמירה ל-DB ---
async def save_ohlc(doc):
    result = await ohlc_collection.insert_one(doc)
    print("Inserted ID:", result.inserted_id)

# פונקציה לקבלת OHLC
async def get_ohlc(symbol: str, timeframe: str, start_date: str, end_date: str):
    doc = await ohlc_collection.find_one({
        "symbol": symbol,
        "timeframe": timeframe,
        "start_date": {"$lte": start_date},
        "end_date": {"$gte": end_date}
    })
    
    if doc:
        filtered_ohlc = [candle for candle in doc['ohlc'] 
                         if start_date <= candle['datetime'] <= end_date]
        return filtered_ohlc

    return None

  # אם אתה מריץ את הקובץ לבד

# מומלץ לקרוא פעם אחת בעליית השרת
async def ensure_indexes() -> None:
    await ohlc_collection.create_index(
        [("symbol", 1), ("timeframe", 1), ("start_date", 1), ("end_date", 1)],
        name="symbol_timeframe_range"
    )

# ---------- helpers ----------
def _iso_date_str(d: Union[str, date, datetime]) -> str:
    """החזר מחרוזת תאריך YYYY-MM-DD."""
    if isinstance(d, datetime):
        return d.date().isoformat()
    if isinstance(d, date):
        return d.isoformat()
    # אם כבר מחרוזת, נקח רק את החלק של התאריך אם מגיע עם זמן
    return d[:10]

def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()

def _df_to_records(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """ממיר DataFrame לרשימת dicts עם datetime כמחרוזת וערכים מספריים כ-float."""
    out = df.copy()

    # אם datetime לא בעמודות אלא באינדקס—העבר לעמודה
    if "datetime" not in out.columns:
        out = out.reset_index().rename(columns={"index": "datetime"})

    # ודא ש-datetime הוא מחרוזת סטנדרטית
    out["datetime"] = pd.to_datetime(out["datetime"], errors="coerce")
    out["datetime"] = out["datetime"].dt.strftime("%Y-%m-%d %H:%M:%S")

    # כפיית טיפוסים מספריים
    for col in ("open", "high", "low", "close", "volume"):
        if col in out.columns:
            out[col] = out[col].astype(float)

    # Mongo לא אוהב NaN/NaT -> המר ל-None
    out = out.replace({np.nan: None})
    return out.to_dict(orient="records")

def _parse_dt(s: str) -> datetime:
    # תומך גם ב-"YYYY-MM-DD HH:MM:SS" וגם ב-ISO עם Z
    s = s.replace("Z", "")
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        # fallback: אם יש רווח בין תאריך לשעה בלי T
        try:
            return datetime.strptime(s, "%Y-%m-%d %H:%M:%S")
        except Exception:
            # נסיון מינימלי – אם נכשל נחזיר כעת כדי לא להפיל
            return datetime.now(timezone.utc)

# ---------- core ----------
async def get_ohlc_from_db(
    symbol: str,
    timeframe: str,
    start_date: str,
    end_date: Optional[str] = None,
) -> Optional[pd.DataFrame]:
    """
    מחפש דוקומנט שמכסה לגמרי את הטווח [start_date, end_date] ל-symbol+timeframe.
    אם נמצא -> מחזיר DataFrame מסונן לטווח המבוקש (ממויין לפי datetime).
    אם לא נמצא -> None.
    """
    start_d = _iso_date_str(start_date)
    end_d = _iso_date_str(end_date or _utc_now_iso())

    doc = await ohlc_collection.find_one({
        "symbol": symbol,
        "timeframe": timeframe,
        "start_date": {"$lte": start_d},
        "end_date": {"$gte": end_d},
    })

    if not doc:
        return None

    candles: List[Dict[str, Any]] = doc.get("ohlc", [])
    # חיתוך לטווח זמן
    start_dt = datetime.fromisoformat(start_d + "T00:00:00")
    end_dt = datetime.fromisoformat(end_d + "T23:59:59")

    filtered = [
        c for c in candles
        if "datetime" in c and start_dt <= _parse_dt(c["datetime"]) <= end_dt
    ]

    if not filtered:
        return pd.DataFrame(columns=["datetime", "open", "high", "low", "close", "volume"])

    df = pd.DataFrame(filtered)
    # המרה ל-datetime ומיון
    df["datetime"] = pd.to_datetime(df["datetime"], utc=False, errors="coerce")
    df = df.sort_values("datetime").reset_index(drop=True)
    return df

async def save_ohlc_to_db(
    symbol: str,
    timeframe: str,
    start_date: str,
    end_date: str,
    ohlc: List[Dict[str, Any]],
) -> None:
    """
    שומר/מעדכן דוקומנט בפורמט:
    {
      symbol, timeframe, start_date, end_date, ohlc: [...], fetched_at
    }
    ה-upsert מבוסס על (symbol,timeframe,start_date).
    """
# document = {
#     "symbol": "AAPL",
#     "timeframe": "1h",
#     "start_date": "2021-01-04",
#     "end_date": "2025-08-19",
#     "ohlc": ohlc_data,   # כאן נכנס כל התוכן של הקובץ
#     "fetched_at": datetime.utcnow().isoformat()
# }

    if isinstance(ohlc, pd.DataFrame):
        ohlc_records = _df_to_records(ohlc)
    else:
        # נניח שכבר list[dict]
        ohlc_records = ohlc
    
    end_date_str = datetime.fromisoformat(end_date).date().isoformat()

    payload = {
        "symbol": symbol,
        "timeframe": timeframe,
        "start_date": _iso_date_str(start_date),
        "end_date": end_date_str,
        "ohlc": ohlc_records,
        "fetched_at": _utc_now_iso(),
    }

    await save_ohlc(payload)

    # await ohlc_collection.update_one(
    #     {"symbol": payload["symbol"], "timeframe": payload["timeframe"], "start_date": payload["start_date"]},
    #     {"$set": payload},
    #     upsert=True,
    # )

if __name__ == "__main__":
    asyncio.run(test_db())
