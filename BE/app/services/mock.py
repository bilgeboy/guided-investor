BACK_TEST_MOCK = {
  "stocks": [
    {
      "symbol": "AAPL",
      "investment": 1000,
      "max_loss": 50,
      "timeframe": "1h",
      "start_date": "2025-01-01",
      "since_ipo": False,
      "entry_rules": [
        {"indicator": "rsi", "operator": "<", "value": 30}
      ],
      "exit_conditions": [
        {"type": "take_profit", "profit": 100},
        {"type": "stop_loss", "loss": 50}
      ]
    },
    {
      "symbol": "NVDA",
      "investment": 500,
      "max_loss": 25,
      "timeframe": "5m",
      "entry_rules": [
        {"indicator": "sma", "operator": "crossesAbove", "value": 200}
      ],
      "exit_conditions": [
        {"type": "take_profit", "profit": 50},
        {"type": "stop_loss", "loss": 25}
      ]
    }
  ]
}
