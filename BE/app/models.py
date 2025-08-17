from pydantic import BaseModel, Field
from typing import Any, List, Optional, Literal
from datetime import date

class Strategy(BaseModel):
    id: str
    symbol: str
    rules: List[dict]  # מגיע מה-RuleBuilder בפרונט
    amount: float
    maxLoss: float

class StrategyCreateResponse(BaseModel):
    ok: bool
    id: str

class TickOut(BaseModel):
    type: str = "tick"
    symbol: str
    price: float
    ts: int
    rsi: Optional[float] = None
    macd: Optional[float] = None
    signal: Optional[float] = None
    hist: Optional[float] = None
    sma50: Optional[float] = None
    decision: str = "hold"
    reason: str = ""

# סוגי אינדיקטורים ותנאים
IndicatorType = Literal["rsi","cci","macd","sma","ema","bbands"]
OperatorType = Literal["crossesAbove","crossesBelow",">","<",">=","<="]

class IndicatorRule(BaseModel):
    indicator: IndicatorType
    params: dict = Field(default_factory=dict)  # לדוג' period, fast, slow וכו'
    operator: OperatorType
    value: float
    value2: Optional[float] = None  # עבור טווח
    compare_to: Optional[Literal["price","sma","ema","none"]] = "none"
    compare_period: Optional[int] = None

class ExitCondition(BaseModel):
    type: Literal["take_profit","stop_loss","indicator"]
    value: Optional[float] = None
    indicator_rule: Optional[IndicatorRule] = None

class StockStrategy(BaseModel):
    symbol: str
    investment: float  # כמה להשקיע
    max_loss: float    # Stop Loss
    timeframe: str     # נר של דקה/שעה/יום וכו'
    start_date: Optional[date] = None
    since_ipo: bool = False
    entry_rules: List[IndicatorRule]
    exit_conditions: List[ExitCondition]

class BacktestRequest(BaseModel):
    stocks: List[StockStrategy]
