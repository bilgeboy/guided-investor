import json, datetime
import re
import httpx
from typing import Dict, Any
from ..settings import settings
from groq import Groq  # Add this import for Groq SDK

# מחלץ את ה-JSON מהתשובה גם אם המודל יספר "סיפור" מסביב
JSON_RE = re.compile(r"\{.*?\}", re.S)

SYSTEM_PROMPT = (
    "You are a trading decision engine. "
    "Decide BUY, SELL or HOLD for the next bar, based ONLY on the structured data I give you.\n"
    "STRICT RULES:\n"
    "- Return ONLY a single JSON object. No prose, no code fences.\n"
    '- JSON keys/types schema: {"action":"buy|sell|hold","confidence":number,"reason":string,"stop_loss":number|null,"take_profit":number|null}\n'
    '- If not enough data, return {"action":"hold","confidence":0.1,"reason":"insufficient data","stop_loss":null,"take_profit":null}.\n'
    "- Never include any additional fields."
)

def build_user_prompt(symbol: str, tf: str, o: float, h: float, l: float, c: float,
                      ind: Dict[str, Any], closes: list[float],
                      rules: list[dict], amount: float, max_loss: float) -> str:
    now = datetime.datetime.utcnow().isoformat() + "Z"
    return (
f"""symbol: {symbol}
timeframe: {tf}
now_utc: {now}

latest_bar:
  ohlc: {{open: {o}, high: {h}, low: {l}, close: {c}}}
  indicators:
    rsi_14: {ind.get('rsi')}
    macd: {{macd: {ind.get('macd')}, signal: {ind.get('signal')}, hist: {ind.get('hist')}}}
    sma_50: {ind.get('sma50')}
  recent_bars_close: {json.dumps(closes)}

strategy_rules: {json.dumps(rules)}

constraints:
- trade_size_usd: {amount}
- max_loss_usd: {max_loss}
- prefer fewer trades unless signal is strong.

Your output: ONLY the JSON object as per schema."""
    )

def _safe_parse_json(text: str) -> Dict[str, Any]:
    m = JSON_RE.search(text.strip())
    if not m:
        return {"action":"hold","confidence":0.1,"reason":"no-json","stop_loss":None,"take_profit":None}
    try:
        obj = json.loads(m.group(0))
        act = obj.get("action","hold")
        if act not in ("buy","sell","hold"): act = "hold"
        conf = float(obj.get("confidence", 0) or 0)
        expl = str(obj.get("reason",""))
        sl = obj.get("stop_loss", None)
        tp = obj.get("take_profit", None)
        return {"action": act, "confidence": conf, "reason": expl, "stop_loss": sl, "take_profit": tp}
    except Exception:
        return {"action":"hold","confidence":0.1,"reason":"parse-failed","stop_loss":None,"take_profit":None}

async def _call_groq(system: str, user: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(
            settings.AI_ENDPOINT,
            headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
            json={
                "model": settings.AI_MODEL,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user}
                ],
                "temperature": 0.2
            }
        )
        r.raise_for_status()
        data = r.json()
        text = (data.get("choices") or [{}])[0].get("message",{}).get("content","")
        return _safe_parse_json(text)
    

async def _call_openrouter(system: str, user: str) -> Dict[str, Any]:
    headers = {"Authorization": f"Bearer {settings.AI_API_KEY}", "Content-Type":"application/json"}
    payload = {
        "model": settings.AI_MODEL,  # למשל "mistralai/mistral-7b-instruct"
        "messages": [
            {"role":"system","content": system},
            {"role":"user","content": user}
        ],
        "temperature": 0.2
    }
    endpoint = settings.AI_ENDPOINT  # למשל https://openrouter.ai/api/v1/chat/completions
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(endpoint, headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()
    text = (data.get("choices") or [{}])[0].get("message",{}).get("content","")
    return _safe_parse_json(text)

async def _call_ollama(system: str, user: str) -> Dict[str, Any]:
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": system + "\n\n" + user,
        "stream": False
    }
    async with httpx.AsyncClient(timeout=120) as c:
        r = await c.post(settings.OLLAMA_ENDPOINT, json=payload)
        r.raise_for_status()
        data = r.json()
    # Ollama: השדה בד"כ "response"
    text = data.get("response","")
    return _safe_parse_json(text)

async def ask_ai_free(symbol: str, tf: str, o: float, h: float, l: float, c: float,
                      ind: Dict[str, Any], closes: list[float],
                      rules: list[dict], amount: float, max_loss: float) -> Dict[str, Any]:
    """נקודת כניסה אחידה – בוחר ספק לפי settings.AI_PROVIDER"""
    user = build_user_prompt(symbol, tf, o,h,l,c, ind, closes, rules, amount, max_loss)
    provider = settings.AI_PROVIDER.lower()
    try:
        if provider == "groq":
            return await _call_groq(SYSTEM_PROMPT, user)
        elif provider == "openrouter":
            return await _call_openrouter(SYSTEM_PROMPT, user)
        elif provider == "ollama":
            return await _call_ollama(SYSTEM_PROMPT, user)
        else:
            return {"action":"hold","confidence":0.1,"reason":f"unknown-provider:{provider}","stop_loss":None,"take_profit":None}
    except Exception as e:
        return {"action":"hold","confidence":0.1,"reason":f"ai-error:{e}","stop_loss":None,"take_profit":None}
