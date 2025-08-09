# app/services/broker/alpaca.py
import httpx, os
from .base import BrokerBase

class AlpacaBroker(BrokerBase):
    def __init__(self):
        self.base = os.getenv("APCA_BASE_URL")
        self.key = os.getenv("APCA_KEY_ID")
        self.secret = os.getenv("APCA_SECRET")
        self.h = {"APCA-API-KEY-ID": self.key, "APCA-API-SECRET-KEY": self.secret}

    async def get_account(self):
        async with httpx.AsyncClient() as c:
            r = await c.get(f"{self.base}/v2/account", headers=self.h)
            r.raise_for_status(); return r.json()

    async def get_positions(self):
        async with httpx.AsyncClient() as c:
            r = await c.get(f"{self.base}/v2/positions", headers=self.h)
            r.raise_for_status(); return r.json()

    async def place_order(self, symbol, qty, side, tif="day", type="market", limit_price=None):
        payload = {"symbol":symbol,"qty":qty,"side":side,"time_in_force":tif,"type":type}
        if limit_price: payload["limit_price"]=limit_price
        async with httpx.AsyncClient() as c:
            r = await c.post(f"{self.base}/v2/orders", headers=self.h, json=payload)
            r.raise_for_status(); return r.json()
