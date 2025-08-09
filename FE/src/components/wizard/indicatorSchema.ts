// src/components/wizard/indicatorSchema.ts
import { z } from "zod";

export const IndicatorTypes = [
  "rsi",
  "cci",
  "macd",
  "sma",
  "ema",
  "bbands",
] as const;
export const Timeframes = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;
export const Operators = [
  "crossesAbove",
  "crossesBelow",
  ">",
  "<",
  ">=",
  "<=",
] as const;

export const RuleSchema = z.object({
  indicator: z.enum(IndicatorTypes),
  timeframe: z.enum(Timeframes).default("1m"),
  // פרמטרים ייחודיים לכל אינדיקטור
  params: z
    .object({
      period: z.number().int().positive().optional(), // לדוגמה RSI/CCI/SMA/EMA
      fast: z.number().int().positive().optional(), // MACD fast
      slow: z.number().int().positive().optional(), // MACD slow
      signal: z.number().int().positive().optional(), // MACD signal
      stddev: z.number().positive().optional(), // BB std dev
      source: z.enum(["close", "open", "high", "low"]).optional(),
    })
    .default({}),
  // תנאי
  operator: z.enum(Operators),
  value: z.number().optional(), // סף (RSI/CCI/BB)
  value2: z.number().optional(), // לטווח/ערך נוסף אם צריך
  compareTo: z.enum(["price", "sma", "ema", "none"]).default("none").optional(), // לדוג׳ "מחיר מול MA"
  comparePeriod: z.number().int().positive().optional(), // פרק זמן של MA להשוואה
});

export type Rule = z.infer<typeof RuleSchema>;

export const IndicatorFormSchema = z.object({
  rules: z.array(RuleSchema).min(1, "הוסף לפחות חוק אחד"),
});
export type IndicatorFormData = z.infer<typeof IndicatorFormSchema>;
