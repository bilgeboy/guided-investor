# app/services/execution.py
from dataclasses import dataclass
from typing import Optional

@dataclass
class Position:
    symbol: str
    qty: float
    entry_price: float

class PaperEngine:
    def __init__(self):
        self.cash = 10000.0
        self.positions: dict[str, Position] = {}
        self.pnl_realized = 0.0

    def on_signal(self, symbol: str, price: float, decision: str, amount: float):
        if decision == "buy":
            if symbol in self.positions: return  # כבר בפנים
            qty = max(1, int(amount / price))
            cost = qty * price
            if self.cash >= cost:
                self.positions[symbol] = Position(symbol, qty, price)
                self.cash -= cost

        elif decision == "sell":
            pos = self.positions.get(symbol)
            if not pos: return
            proceeds = pos.qty * price
            self.pnl_realized += proceeds - (pos.qty * pos.entry_price)
            self.cash += proceeds
            del self.positions[symbol]

    def equity(self, last_prices: dict[str, float]):
        open_pnl = sum((last_prices[s]-p.entry_price)*p.qty for s,p in self.positions.items())
        return {"cash": self.cash, "pnl_realized": self.pnl_realized, "pnl_open": open_pnl, "equity": self.cash + self.pnl_realized + open_pnl}
