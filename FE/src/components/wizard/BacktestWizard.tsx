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
import { IndicatorFormSchema } from "./indicatorSchema";

const BacktestSchema = IndicatorFormSchema.extend({
  symbols: z.array(z.string().min(1)).min(1, "בחר לפחות נכס אחד"),
  amount: z.number().positive(),
  maxLoss: z.number().positive(),
  earningsPlay: z.object({
    enabled: z.boolean().default(false),
    daysBefore: z.number().int().min(0).max(30).default(0),
    daysAfter: z.number().int().min(0).max(30).default(0),
  }),
  newsPlay: z.object({
    enabled: z.boolean().default(false),
    category: z.enum(["all", "financial", "tech", "regulatory"]).default("all"),
  }),
});

type BacktestForm = z.infer<typeof BacktestSchema>;
const STEPS = [1, 2, 3, 4, 5];

export default function BacktestWizard() {
  const [step, setStep] = useState(1);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const form = useForm<BacktestForm>({
    resolver: zodResolver(BacktestSchema),
    defaultValues: {
      rules: [
        {
          indicator: "rsi",
          timeframe: "1m",
          params: { period: 14, source: "close" },
          operator: "crossesBelow",
          value: 30,
          compareTo: "none",
        },
      ],
      symbols: [],
      amount: 1000,
      maxLoss: 100,
      earningsPlay: { enabled: false, daysBefore: 2, daysAfter: 2 },
      newsPlay: { enabled: false, category: "all" },
    },
    mode: "onChange",
  });

  const { setValue, watch, handleSubmit, formState, control } = form;
  const symbols = watch("symbols");
  const values = watch();

  const addSymbol = (s: string) => {
    if (!s) return;
    if (!symbols.includes(s))
      setValue("symbols", [...symbols, s.toUpperCase()], {
        shouldValidate: true,
      });
  };
  const removeSymbol = (s: string) =>
    setValue(
      "symbols",
      symbols.filter((x) => x !== s),
      { shouldValidate: true }
    );

  const next = () => {
    if (step === 1 && (!values.rules || values.rules.length < 1)) return;
    if (step === 2 && symbols.length < 1) return;
    if (step === 3 && (!values.amount || !values.maxLoss)) return;
    setStep((s) => Math.min(5, s + 1));
  };
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const onRun = handleSubmit(async (payload) => {
    setRunning(true);
    const res = await mockBacktestRun(payload);
    setResult(res);
    setRunning(false);
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
            {step === 1 && "בחר קריטריונים"}
            {step === 2 && "בחר נכסים"}
            {step === 3 && "סכום וסיכון"}
            {step === 4 && "דוחות/חדשות"}
            {step === 5 && "סקירה והרצה"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <FormProvider {...form}>
              <RuleBuilder />
            </FormProvider>
          )}

          {step === 2 && (
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
                {symbols.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                  >
                    {s}{" "}
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeSymbol(s)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {symbols.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    טרם נבחרו סימבולים
                  </p>
                )}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>סכום השקעה ($)</Label>
                <Input
                  type="number"
                  value={values.amount}
                  onChange={(e) =>
                    setValue("amount", Number(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                />
                <Slider
                  value={[values.amount]}
                  min={100}
                  max={10000}
                  step={50}
                  onValueChange={([v]) =>
                    setValue("amount", v, { shouldValidate: true })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>מקס׳ הפסד ($)</Label>
                <Input
                  type="number"
                  value={values.maxLoss}
                  onChange={(e) =>
                    setValue("maxLoss", Number(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                />
                <Slider
                  value={[values.maxLoss]}
                  min={20}
                  max={values.amount || 1000}
                  step={10}
                  onValueChange={([v]) =>
                    setValue("maxLoss", v, { shouldValidate: true })
                  }
                />
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={values.earningsPlay.enabled}
                    onCheckedChange={(v) =>
                      setValue("earningsPlay.enabled", !!v)
                    }
                  />
                  <Label>כלול לוגיקה סביב דוחות</Label>
                </div>
                {values.earningsPlay.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>ימים לפני</Label>
                      <Input
                        type="number"
                        value={values.earningsPlay.daysBefore}
                        onChange={(e) =>
                          setValue(
                            "earningsPlay.daysBefore",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>ימים אחרי</Label>
                      <Input
                        type="number"
                        value={values.earningsPlay.daysAfter}
                        onChange={(e) =>
                          setValue(
                            "earningsPlay.daysAfter",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={values.newsPlay.enabled}
                    onCheckedChange={(v) => setValue("newsPlay.enabled", !!v)}
                  />
                  <Label>כלול לוגיקה סביב חדשות</Label>
                </div>
                {values.newsPlay.enabled && (
                  <div>
                    <Label>סוג חדשות</Label>
                    <Select
                      value={values.newsPlay.category}
                      onValueChange={(v) =>
                        setValue("newsPlay.category", v as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">הכל</SelectItem>
                        <SelectItem value="financial">פיננסיות</SelectItem>
                        <SelectItem value="tech">טכנולוגיות</SelectItem>
                        <SelectItem value="regulatory">רגולטוריות</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-4">
              <SummaryRow label="נכסים" value={symbols.join(", ") || "—"} />
              <SummaryRow
                label="חוקים"
                value={values.rules
                  .map((r) => r.indicator.toUpperCase())
                  .join(", ")}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <SummaryRow label="סכום ($)" value={String(values.amount)} />
                <SummaryRow
                  label="מקס׳ הפסד ($)"
                  value={String(values.maxLoss)}
                />
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <SummaryRow
                  label="דוחות"
                  value={
                    values.earningsPlay.enabled
                      ? `כן (${values.earningsPlay.daysBefore}/${values.earningsPlay.daysAfter})`
                      : "לא"
                  }
                />
                <SummaryRow
                  label="חדשות"
                  value={
                    values.newsPlay.enabled ? values.newsPlay.category : "לא"
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

              {result && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>תוצאות (Mock)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm grid grid-cols-2 gap-3">
                    <SummaryRow
                      label="עסקאות"
                      value={String(result.summary.totalTrades)}
                    />
                    <SummaryRow
                      label="Win Rate"
                      value={(result.summary.winRate * 100).toFixed(1) + "%"}
                    />
                    <SummaryRow
                      label="ממוצע P&L"
                      value={result.summary.avgPnL + "%"}
                    />
                    <SummaryRow
                      label="Max DD"
                      value={result.summary.maxDrawdown + "%"}
                    />
                  </CardContent>
                </Card>
              )}
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
                  (step === 1 && (!values.rules || values.rules.length < 1)) ||
                  (step === 2 && symbols.length < 1) ||
                  (step === 3 && (!values.amount || !values.maxLoss))
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
