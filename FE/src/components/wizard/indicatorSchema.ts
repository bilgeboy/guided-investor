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
export const Timeframes = [
  "1m",
  "5m",
  "15m",
  "1h",
  "4h",
  "1d",
  "1w",
  "1M",
] as const;
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

// --- ExitCondition
export const ExitConditionSchema = z.object({
  type: z.enum(["take_profit", "stop_loss", "indicator"]),
  value: z.number().optional(),
  indicator_rule: RuleSchema.optional(),
});

export type ExitCondition = z.infer<typeof ExitConditionSchema>;

// --- EarningsPlay / NewsPlay
export const EarningsPlaySchema = z.object({
  enabled: z.boolean().default(false),
  daysBefore: z.number().int().min(0).max(30).default(2),
  daysAfter: z.number().int().min(0).max(30).default(2),
});

export const NewsPlaySchema = z.object({
  enabled: z.boolean().default(false),
  category: z.enum(["all", "financial", "tech", "regulatory"]).default("all"),
});

// --- StockStrategy
export const StockStrategySchema = z.object({
  symbol: z.string().min(1),
  investment: z.number().positive(),
  max_loss: z.number().positive(),
  timeframe: z.enum(Timeframes),
  start_date: z.string().optional(), // FE שולח כ-string, BE ממפה ל-date
  end_date: z.string().optional(),
  since_ipo: z.boolean().default(false),
  entry_rules: z.array(RuleSchema).min(1),
  exit_conditions: z.array(ExitConditionSchema).min(1),
  earningsPlay: EarningsPlaySchema,
  newsPlay: NewsPlaySchema,
});

export type StockStrategy = z.infer<typeof StockStrategySchema>;

// --- BacktestRequest
export const BacktestRequestSchema = z.object({
  stocks: z.array(StockStrategySchema).min(1),
});

export type BacktestRequest = z.infer<typeof BacktestRequestSchema>;
