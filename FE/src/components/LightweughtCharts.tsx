import React, { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  ISeriesApi,
  CandlestickData,
  AreaSeries,
  BarSeries,
  CandlestickSeries,
  SeriesMarker,
  createSeriesMarkers,
} from "lightweight-charts";

export default function TradesChart({
  trades,
  symbol,
  ohlc,
}: {
  trades: any[];
  symbol: string;
  ohlc: any[];
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#000",
      },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
    });

    // גרסה חדשה: יצירת סריס מסוג candlestick
    // Use the correct method name based on the library version
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    // דוגמת דאטה (OHLCV אמיתי מה־API שלך)
    // candleSeries.setData([
    //   { time: "2023-01-01", open: 140, high: 150, low: 138, close: 145 },
    //   { time: "2023-01-02", open: 145, high: 155, low: 142, close: 150 },
    //   { time: "2023-01-03", open: 150, high: 152, low: 140, close: 141 },
    // ]);
    candleSeries.setData(
      ohlc.map((c) => ({
        time: c.date,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    // סימון נקודות Entry/Exit
    // candleSeries.setMarkers(
    // trades
    //   .map((t) => ({
    //     time: t.entry_date, // צריך להיות בפורמט YYYY-MM-DD
    //     position: "belowBar",
    //     color: "green",
    //     shape: "arrowUp",
    //     text: `BUY @ ${t.entry_price}`,
    //   }))
    //   .concat(
    //     trades.map((t) => ({
    //       time: t.exit_date,
    //       position: "aboveBar",
    //       color: "red",
    //       shape: "arrowDown",
    //       text: `SELL @ ${t.exit_price}`,
    //     }))
    //   )
    // );
    const markers: SeriesMarker[] = trades
      .map((t) => ({
        time: t.entry_date, // צריך להיות בפורמט YYYY-MM-DD
        position: "belowBar",
        color: "green",
        shape: "arrowUp",
        text: `BUY @ ${t.entry_price}`,
      }))
      .concat(
        trades.map((t) => ({
          time: t.exit_date,
          position: "aboveBar",
          color: "red",
          shape: "arrowDown",
          text: `SELL @ ${t.exit_price}`,
        }))
      );
    createSeriesMarkers(candleSeries, markers);

    // ניקוי עם הרס התרשים
    return () => chart.remove();
  }, [trades]);

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />
  );
}
