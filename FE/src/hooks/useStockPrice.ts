// src/hooks/useStockPrice.ts
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

export default function useStockPrice(symbol: string): number | null {
  const [price, setPrice] = useState<number | null>(null);

  const fetchPrice = async () => {
    try {
      const res = await api.get(`/price/${symbol}`);
      console.log(res.data.data);
      setPrice(res.data.price);
    } catch (err) {
      console.error(`שגיאה בקבלת מחיר עבור ${symbol}:`, err);
    }
  };

  useEffect(() => {
    fetchPrice(); // בקשה מיידית
    const interval = setInterval(fetchPrice, 20_000); // כל דקה
    return () => clearInterval(interval);
  }, [symbol]);

  return price;
}
