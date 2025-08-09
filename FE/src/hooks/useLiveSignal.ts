import { useEffect, useRef, useState } from "react";

export function useLiveSignal({
  symbol,
  strategyId,
}: {
  symbol: string;
  strategyId: string;
}) {
  const [data, setData] = useState<any | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = `ws://localhost:8000/ws/stream?symbol=${encodeURIComponent(
      symbol
    )}&strategy_id=${strategyId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onmessage = (ev) => {
      try {
        setData(JSON.parse(ev.data));
      } catch {
        /* empty */
      }
    };
    ws.onclose = () => {
      /* אפשר לנסות reconnect */
    };
    return () => {
      ws.close();
    };
  }, [symbol, strategyId]);

  return data;
}
