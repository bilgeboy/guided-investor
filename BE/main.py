from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

load_dotenv() # טען את קובץ הסביבה

app = FastAPI()

ALPHA_API_KEY = os.getenv("ALPHA_API_KEY")  # קרא את המפתח מהסביבה

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")  # קרא את המפתח מהסביבה

# התיר בקשות מהפרונט
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # באבטחת PROD תצמצם את זה
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.get("/api/price/{symbol}")
# def get_price(symbol: str):
#     url = f"https://www.alphavantage.co/query"
#     params = {
#         "function": "TIME_SERIES_INTRADAY",
#         "symbol": symbol,
#         "interval": "1min",  # אפשר גם 5min, 15min, 30min, 60min
#         "apikey": ALPHA_API_KEY,
#         "outputsize": "compact"  # או full להיסטוריה מלאה
#     }

#     response = requests.get(url, params=params)
#     # print("Status code:", response.status_code)
#     # print("Response:")
#     print(response.json())

#     data = response.json()

#     try:
#         # price = float(data["Global Quote"]["05. price"])
#         # return {"symbol": symbol, "price": price, "data": data}
#         return {"data": data}
#     except Exception as e:
#         return {"error": "Failed to fetch price", "details": str(e), "raw": data}

@app.get("/api/price/{symbol}")
def get_price(symbol: str):
    url = f"https://finnhub.io/api/v1/quote"
    params = {
        "symbol": symbol,
        "token": FINNHUB_API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    try:
        # מחזיר רק מחיר נוכחי, אבל אפשר לחשוף הכל
        price = float(data["c"])
        return {
            "symbol": symbol,
            "price": price,
            "data": data  # כולל open, high, low וכו'
        }
    except Exception as e:
        return {
            "error": "Failed to fetch price",
            "details": str(e),
            "data": data
        }
