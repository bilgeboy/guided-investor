from app.factory import create_app
# import yfinance as yf
# import pandas as pd
# from datetime import datetime, timedelta

# ticker = "AAPL"
# interval = "1m"

# end = datetime.today()
# start = end - timedelta(days=7)

# all_data = pd.DataFrame()

# for i in range(0, 60, 7):  # last 60 days in 7-day chunks
#     chunk_end = end - timedelta(days=i)
#     chunk_start = chunk_end - timedelta(days=7)
#     data = yf.download(ticker, start=chunk_start, end=chunk_end, interval=interval)
#     all_data = pd.concat([all_data, data])

# all_data.to_csv("AAPL_intraday_1m.csv")

# ה"אפליקציה" האמיתית נוצרת מפונקציה חיצונית
app = create_app()

# הפעלה מקומית:
# uvicorn backend.main:app --reload --port 8000