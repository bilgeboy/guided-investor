import { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mockBacktestRun } from "@/api/mock";
import RuleBuilder from "./RuleBuilder";
import {
  BacktestRequestSchema,
  IndicatorFormSchema,
  Timeframes,
} from "./indicatorSchema";
import TradesTable from "./TradesTable";
import api from "@/api/axiosInstance"; // ייבוא של האינסְטנס שלך
import axios from "axios";
import TradesChart from "../LightweughtCharts";

type BacktestForm = z.infer<typeof BacktestRequestSchema>;
const STEPS = [1, 2, 3, 4, 5];

export default function BacktestWizard() {
  const [step, setStep] = useState(1);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const form = useForm<BacktestForm>({
    resolver: zodResolver(BacktestRequestSchema),
    defaultValues: {
      stocks: [
        // {
        //   symbol: "",
        //   investment: 1000,
        //   max_loss: 100,
        //   timeframe: "1h",
        //   start_date: "",
        //   since_ipo: false,
        //   entry_rules: [
        //     {
        //       indicator: "rsi",
        //       params: { period: 14, source: "close" },
        //       operator: "crossesBelow",
        //       value: 30,
        //       compareTo: "none",
        //     },
        //   ],
        //   exit_conditions: [
        //     { type: "take_profit", value: 100 },
        //     { type: "stop_loss", value: 50 },
        //   ],
        //   earningsPlay: { enabled: false, daysBefore: 2, daysAfter: 2 },
        //   newsPlay: { enabled: false, category: "all" },
        // },
      ],
    },
    mode: "onChange",
  });

  const { setValue, watch, handleSubmit, formState, control } = form;
  const stocks = watch("stocks");
  const values = watch();
  console.log(values);

  // הוספת מניה חדשה למערך stocks
  const addSymbol = (s: string) => {
    if (!s) return;
    const currentStocks = watch("stocks") || [];
    // אם כבר קיים סמל כזה, לא מוסיפים
    if (currentStocks.some((stock) => stock.symbol === s.toUpperCase())) return;

    setValue(
      "stocks",
      [
        ...currentStocks,
        {
          symbol: s.toUpperCase(),
          investment: 1000,
          max_loss: 100,
          timeframe: "1h",
          start_date: "",
          since_ipo: false,
          entry_rules: [
            {
              indicator: "rsi",
              params: { period: 14, source: "close" },
              operator: "crossesBelow",
              value: 30,
              // compare_to: "none",
              // compare_period: undefined,
            },
          ],
          exit_conditions: [
            { type: "take_profit", value: 100 },
            { type: "stop_loss", value: 50 },
          ],
          earningsPlay: { enabled: false, daysBefore: 2, daysAfter: 2 },
          newsPlay: { enabled: false, category: "all" },
        },
      ],
      { shouldValidate: true }
    );
  };

  // הסרת מניה ממערך stocks לפי סמל
  const removeSymbol = (s: string) => {
    const currentStocks = watch("stocks") || [];
    setValue(
      "stocks",
      currentStocks.filter((stock) => stock.symbol !== s),
      { shouldValidate: true }
    );
  };

  const next = () => {
    const stocks = values.stocks || [];

    // שלב 1: בדיקה אם לכל סטטגיה יש entry_rules
    if (
      step === 1 &&
      stocks.some((s) => !s.entry_rules || s.entry_rules.length < 1)
    )
      return;

    // שלב 2: בדיקה אם יש לפחות מניה אחת
    if (step === 2 && stocks.length < 1) return;

    // שלב 3: בדיקה אם לכל מניה יש investment ו-max_loss
    if (step === 3 && stocks.some((s) => !s.investment || !s.max_loss)) return;

    setStep((s) => Math.min(5, s + 1));
  };

  const prev = () => setStep((s) => Math.max(1, s - 1));

  const PAYLOAD_MOCK = {
    stocks: [
      {
        symbol: "AAPL",
        investment: 1000,
        max_loss: 50,
        timeframe: "1h",
        start_date: "2021-01-01",
        since_ipo: false,
        entry_rules: [
          {
            indicator: "sma",
            operator: "<",
            value: 0,
          },
        ],
        exit_conditions: [
          {
            type: "take_profit",
            value: 100,
          },
          {
            type: "stop_loss",
            value: 50,
          },
        ],
      },
      {
        symbol: "NVDA",
        investment: 500,
        max_loss: 25,
        timeframe: "5m",
        start_date: "2021-01-01",
        since_ipo: false,
        entry_rules: [
          {
            indicator: "sma",
            operator: "crossesAbove",
            value: 200,
          },
        ],
        exit_conditions: [
          {
            type: "take_profit",
            value: 50,
          },
          {
            type: "stop_loss",
            value: 25,
          },
        ],
      },
    ],
  };

  const onRun = handleSubmit(async (payload) => {
    try {
      setRunning(true);

      console.log("Payload to send:", payload);

      const health = await axios.get("http://localhost:8000/health");
      console.log("Health check:", health.data);

      // שליחה ישירה ל-BE
      const res = await axios.post(
        "http://localhost:8000/api/strategies-test",
        PAYLOAD_MOCK,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setResult(res.data.results);
    } catch (error: any) {
      console.error("Backtest failed:", error);
      alert(
        error.response?.data?.message || "הרצת הבק-טסט נכשלה. בדוק את הקונסול."
      );
    } finally {
      setRunning(false);
    }
  });

  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <h1 className="text-3xl font-bold text-center mb-2">Backtesting Tool</h1>
      <p className="text-center text-muted-foreground mb-6">
        הרץ בדיקות היסטוריות על פי קריטריונים טכניים
      </p>
      <Stepper step={step} />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">
            {step === 3 && "בחר קריטריונים"}
            {step === 1 && "בחר נכסים"}
            {step === 2 && "סכום וסיכון"}
            {step === 4 && "דוחות/חדשות"}
            {step === 5 && "סקירה והרצה"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 3 && (
            <FormProvider {...form}>
              {values.stocks.map((stock, index) => (
                <div key={stock.symbol || index} className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">
                    חוקים למניה: {stock.symbol || `מניה ${index + 1}`}
                  </h2>
                  <RuleBuilder stockIndex={index} />
                </div>
              ))}
            </FormProvider>
          )}

          {step === 1 && (
            <section className="space-y-3">
              <Label>הוסף סימבול</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="AAPL"
                  onKeyDown={(e: any) => {
                    if (e.key === "Enter") {
                      addSymbol(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    const el = document.querySelector<HTMLInputElement>(
                      'input[placeholder="AAPL"]'
                    );
                    if (el) {
                      addSymbol(el.value);
                      el.value = "";
                    }
                  }}
                >
                  הוסף
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {stocks.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                  >
                    {s.symbol}{" "}
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeSymbol(s.symbol)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {stocks.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    טרם נבחרו סימבולים
                  </p>
                )}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              {values.stocks.map((stock, index) => (
                <Card key={index} className="p-4">
                  <CardHeader>
                    <CardTitle>נכס {stock.symbol || index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>סכום השקעה ($)</Label>
                      <Input
                        type="number"
                        value={stock.investment}
                        onChange={(e) =>
                          setValue(
                            `stocks.${index}.investment`,
                            Number(e.target.value),
                            {
                              shouldValidate: true,
                            }
                          )
                        }
                      />
                      <Slider
                        value={[stock.investment]}
                        min={100}
                        max={10000}
                        step={50}
                        onValueChange={([v]) =>
                          setValue(`stocks.${index}.investment`, v, {
                            shouldValidate: true,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>מקס׳ הפסד ($)</Label>
                      <Input
                        type="number"
                        value={stock.max_loss}
                        onChange={(e) =>
                          setValue(
                            `stocks.${index}.max_loss`,
                            Number(e.target.value),
                            {
                              shouldValidate: true,
                            }
                          )
                        }
                      />
                      <Slider
                        value={[stock.max_loss]}
                        min={20}
                        max={stock.investment || 1000}
                        step={10}
                        onValueChange={([v]) =>
                          setValue(`stocks.${index}.max_loss`, v, {
                            shouldValidate: true,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>טיימפריים</Label>
                      <Select
                        value={stock.timeframe}
                        onValueChange={(v) =>
                          setValue(`stocks.${index}.timeframe`, v as any, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="בחר" />
                        </SelectTrigger>
                        <SelectContent>
                          {Timeframes.map((tf) => (
                            <SelectItem key={tf} value={tf}>
                              {tf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          )}

          {step === 4 && (
            <section className="space-y-4">
              {values.stocks.map((stock, index) => (
                <Card key={index} className="p-4">
                  <CardHeader>
                    <CardTitle>נכס {stock.symbol || index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Earnings Play */}
                    <div className="pl-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={stock.earningsPlay.enabled}
                          onCheckedChange={(v) =>
                            setValue(
                              `stocks.${index}.earningsPlay.enabled`,
                              !!v
                            )
                          }
                        />
                        <Label>כלול לוגיקה סביב דוחות</Label>
                      </div>
                      {stock.earningsPlay?.enabled && (
                        <div className="grid grid-cols-2 gap-3 pl-4">
                          <div>
                            <Label>ימים לפני</Label>
                            <Input
                              type="number"
                              value={stock.earningsPlay.daysBefore}
                              onChange={(e) =>
                                setValue(
                                  `stocks.${index}.earningsPlay.daysBefore`,
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label>ימים אחרי</Label>
                            <Input
                              type="number"
                              value={stock.earningsPlay.daysAfter}
                              onChange={(e) =>
                                setValue(
                                  `stocks.${index}.earningsPlay.daysAfter`,
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* News Play */}
                    <div className="pl-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={stock.newsPlay.enabled}
                          onCheckedChange={(v) =>
                            setValue(`stocks.${index}.newsPlay.enabled`, !!v)
                          }
                        />
                        <Label>כלול לוגיקה סביב חדשות</Label>
                      </div>
                      {stock.newsPlay?.enabled && (
                        <div className="pl-4">
                          <Label>סוג חדשות</Label>
                          <Select
                            value={stock.newsPlay?.category}
                            onValueChange={(v) =>
                              setValue(
                                `stocks.${index}.newsPlay.category`,
                                v as any
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="בחר" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">הכל</SelectItem>
                              <SelectItem value="financial">
                                פיננסיות
                              </SelectItem>
                              <SelectItem value="tech">טכנולוגיות</SelectItem>
                              <SelectItem value="regulatory">
                                רגולטוריות
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          )}

          {step === 5 && (
            <section className="space-y-4">
              {values.stocks.map((stock, idx) => (
                <div key={idx}>
                  <SummaryRow label="סימבול" value={stock.symbol || "—"} />
                  <SummaryRow
                    label="חוקים"
                    value={stock.entry_rules
                      .map((r) => r.indicator.toUpperCase())
                      .join(", ")}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <SummaryRow
                      label="סכום ($)"
                      value={String(stock.investment)}
                    />
                    <SummaryRow
                      label="מקס׳ הפסד ($)"
                      value={String(stock.max_loss)}
                    />
                  </div>
                  <Separator />
                </div>
              ))}

              {/* Earnings / News UI (לפי מה שהיה קודם, UI בלבד) */}
              <div className="grid gap-4 md:grid-cols-2">
                <SummaryRow
                  label="דוחות"
                  value={
                    values.stocks[0]?.earningsPlay?.enabled
                      ? `כן (${values.stocks[0].earningsPlay.daysBefore}/${values.stocks[0].earningsPlay.daysAfter})`
                      : "לא"
                  }
                />
                <SummaryRow
                  label="חדשות"
                  value={
                    values.stocks[0]?.newsPlay?.enabled
                      ? values.stocks[0].newsPlay.category
                      : "לא"
                  }
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={onRun}
                  disabled={running || !formState.isValid}
                >
                  {running ? "מריץ בק-טסט..." : "הרץ Backtest"}
                </Button>
              </div>

              {result?.map((resItem: any, index: number) => (
                <div key={index}>
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>סיכום - סט {resItem.symbol}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm grid grid-cols-2 gap-3">
                      <SummaryRow
                        label="עסקאות"
                        value={new Intl.NumberFormat("en-US").format(
                          resItem.summary.num_trades
                        )}
                      />
                      <SummaryRow
                        label="Win Rate"
                        value={new Intl.NumberFormat("en-US", {
                          style: "percent",
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        }).format(resItem.summary.win_rate / 100)}
                      />
                      <SummaryRow
                        label="ממוצע P&L"
                        value={
                          new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(resItem.summary.avg_deal_profit) + "%"
                        }
                      />
                      <SummaryRow
                        label="Max DD"
                        value={
                          new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(resItem.summary.cumulative_return_pct) + "%"
                        }
                      />
                    </CardContent>
                  </Card>

                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>פרטי העסקאות - סט {resItem.symbol}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* גרף */}
                      {/* <TradesChart
              trades={resItem.trades}
              symbol={resItem.symbol}
              ohlc={resItem.data}
            /> */}

                      {/* טבלה */}
                      <TradesTable
                        trades={resItem.trades.map((t: any) => ({
                          ...t,
                          entry_price: Number(t.entry_price.toFixed(2)),
                          exit_price: Number(t.exit_price.toFixed(2)),
                          pnl: Number(t.pnl.toFixed(2)),
                          pct_return: Number(t.pct_return.toFixed(2)),
                        }))}
                      />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </section>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={prev} disabled={step === 1}>
              חזרה
            </Button>
            {step < 5 ? (
              <Button
                onClick={next}
                disabled={
                  (step === 1 &&
                    values.stocks.some(
                      (stock) =>
                        !stock.entry_rules || stock.entry_rules.length < 1
                    )) ||
                  (step === 2 &&
                    values.stocks.every((stock) => !stock.symbol)) ||
                  (step === 3 &&
                    values.stocks.some(
                      (stock) => !stock.investment || !stock.max_loss
                    ))
                }
              >
                המשך
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((s) => (
        <div key={s} className="flex-1">
          <div
            className={cn(
              "h-2 rounded-full bg-muted",
              s <= step && "bg-primary"
            )}
          />
          <div
            className={cn(
              "mt-1 text-center text-xs text-muted-foreground",
              s === step && "text-primary font-medium"
            )}
          >
            שלב {s}
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
