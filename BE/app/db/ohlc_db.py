from motor.motor_asyncio import AsyncIOMotorClient
from ..settings import settings
from datetime import datetime
import asyncio
import json
import os
# from pymongo import MongoClient

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
if __name__ == "__main__":
    asyncio.run(test_db())
