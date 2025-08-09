import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import FinalConfirmDialog from "./FinalConfirmDialog";
import RuleBuilder from "./RuleBuilder";
import { IndicatorFormSchema, IndicatorFormData } from "./indicatorSchema";
import api from "@/api/axiosInstance";

// ✅ מאחדים את הסכמה של rules עם שדות הוויזרד הנוספים
const WizardSchema = IndicatorFormSchema.extend({
  symbol: z.string().min(1, "סימבול הוא שדה חובה"),
  amount: z.number().positive("סכום חייב להיות חיובי"),
  maxLoss: z.number().positive("הפסד מקס׳ חייב להיות חיובי"),
  broker: z.object({
    name: z.string().min(1, "בחר ברוקר"),
    apiKey: z.string().optional(),
  }),
});
type WizardFormData = z.infer<typeof WizardSchema>;

const STEPS = [1, 2, 3, 4, 5];

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [live, setLive] = useState<{ id: string; symbol: string } | null>(null);

  const form = useForm<WizardFormData>({
    resolver: zodResolver(WizardSchema),
    defaultValues: {
      // ברירת מחדל לחוק ראשון (אפשר להסיר)
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
      symbol: "",
      amount: 1000,
      maxLoss: 100,
      broker: { name: "", apiKey: "" },
    },
    mode: "onChange",
  });

  const { setValue, watch, handleSubmit, formState } = form;
  const values = watch();

  const next = () => {
    // ✅ ולידציה פר-שלב על בסיס השדות הנכונים
    if (step === 1 && (!values.rules || values.rules.length < 1)) return;
    if (step === 2 && !values.symbol) return;
    if (step === 3 && (!values.amount || !values.maxLoss)) return;
    if (step === 4 && !values.broker.name) return;
    setStep((s) => Math.min(5, s + 1));
  };

  const prev = () => setStep((s) => Math.max(1, s - 1));
  const onOpenConfirm = handleSubmit(() => setConfirmOpen(true));

  // עזרה קטנה לתצוגה בסיכום
  const indicatorsSummary =
    values.rules?.map((r) => r.indicator.toUpperCase()).join(", ") || "-";

  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        AI Trader with Indicators
      </h1>
      <p className="text-center text-muted-foreground mb-4">
        הגדר מערכת מסחר אוטומטית מבוססת אינדיקטורים ובינה מלאכותית
      </p>
      <Stepper step={step} />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">
            {step === 1 && "בחר קריטריונים טכניים"}
            {step === 2 && "בחר נכס סחיר"}
            {step === 3 && "קביעת סכום וסיכון"}
            {step === 4 && "התחברות לברוקר"}
            {step === 5 && "סקירה לפני אישור"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <section className="space-y-4">
              {/* FormProvider כדי ש-RuleBuilder יקבל context */}
              <FormProvider {...form}>
                <RuleBuilder />
              </FormProvider>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-2">
              <Label htmlFor="symbol">סימבול (לדוגמה: AAPL)</Label>
              <Input
                id="symbol"
                placeholder="AAPL"
                value={values.symbol}
                onChange={(e) =>
                  setValue("symbol", e.target.value, { shouldValidate: true })
                }
              />
              <p className="text-sm text-muted-foreground">
                אפשר לשלב חיפוש מתקדם/Autocomplete בהמשך.
              </p>
            </section>
          )}

          {step === 3 && (
            <section className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">סכום השקעה ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  inputMode="numeric"
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
                <Label htmlFor="maxLoss">הפסד מקס׳ ($)</Label>
                <Input
                  id="maxLoss"
                  type="number"
                  inputMode="numeric"
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
            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>ברוקר</Label>
                <Select
                  value={values.broker.name}
                  onValueChange={(v) =>
                    setValue("broker.name", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר ברוקר" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ibkr">Interactive Brokers</SelectItem>
                    <SelectItem value="tasty">Tastytrade</SelectItem>
                    <SelectItem value="alpaca">Alpaca</SelectItem>
                    <SelectItem value="paper">Paper Trading</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key (אם נדרש)</Label>
                <Input
                  id="apiKey"
                  placeholder="Optional"
                  value={values.broker.apiKey ?? ""}
                  onChange={(e) => setValue("broker.apiKey", e.target.value)}
                />
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-4">
              <SummaryRow label="נכס" value={values.symbol || "-"} />
              <SummaryRow label="מתנדים" value={indicatorsSummary} />
              <div className="grid gap-4 md:grid-cols-2">
                <SummaryRow label="סכום ($)" value={String(values.amount)} />
                <SummaryRow
                  label="מקס׳ הפסד ($)"
                  value={String(values.maxLoss)}
                />
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <SummaryRow label="ברוקר" value={values.broker.name || "-"} />
                <SummaryRow
                  label="API Key"
                  value={
                    values.broker.apiKey ? mask(values.broker.apiKey) : "—"
                  }
                />
              </div>
            </section>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={prev} disabled={step === 1}>
              חזרה
            </Button>
            {step < 5 ? (
              <Button
                onClick={next}
                // אם תרצה לחייב ולידציה בכל שלב, אפשר פשוט: disabled={!formState.isValid}
                disabled={
                  (step === 1 && (!values.rules || values.rules.length < 1)) ||
                  (step === 2 && !values.symbol) ||
                  (step === 3 && (!values.amount || !values.maxLoss)) ||
                  (step === 4 && !values.broker.name)
                }
              >
                המשך
              </Button>
            ) : (
              <Button onClick={onOpenConfirm} disabled={!formState.isValid}>
                אישור סופי
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {live && <LivePanel symbol={live.symbol} strategyId={live.id} />}

      <FinalConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        data={values}
        onConfirm={async () => {
          const id = crypto.randomUUID();
          await api.post("/strategies", {
            id,
            symbol: values.symbol,
            rules: values.rules,
            amount: values.amount,
            maxLoss: values.maxLoss,
          });
          setConfirmOpen(false);
          setLive({ id, symbol: values.symbol }); // סטייט מקומי לפתיחת פאנל לייב
        }}
      />
    </div>
  );
}

/* ---------- Helpers ---------- */

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

function mask(s: string) {
  if (s.length <= 6) return "••••";
  return s.slice(0, 3) + "••••" + s.slice(-3);
}
