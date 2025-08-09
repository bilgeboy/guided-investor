import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mockBeginnerCreateAccount, mockPlaceFirstTrade } from "@/api/mock";

const Schema = z.object({
  broker: z.string().min(1, "בחר ברוקר"),
  symbol: z.string().min(1, "בחר מניה להתחלה"),
  amount: z.number().positive("סכום חייב להיות חיובי"),
});
type BeginnerForm = z.infer<typeof Schema>;

const STEPS = [1, 2, 3, 4, 5, 6];

export default function BeginnerWizard() {
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);

  const { register, setValue, watch, handleSubmit, formState } =
    useForm<BeginnerForm>({
      resolver: zodResolver(Schema),
      defaultValues: { broker: "", symbol: "", amount: 500 },
      mode: "onChange",
    });

  const values = watch();
  const next = () => {
    if (step === 2 && !values.broker) return;
    if (step === 3 && !values.symbol) return;
    if (step === 4 && !values.amount) return;
    setStep((s) => Math.min(6, s + 1));
  };
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const onCreate = async () => {
    setCreating(true);
    const res = await mockBeginnerCreateAccount(values.broker);
    setNote(res.note);
    setCreating(false);
  };

  const onPlace = async () => {
    setPlacing(true);
    const res = await mockPlaceFirstTrade({
      symbol: values.symbol,
      amount: values.amount,
    });
    setReceipt(res);
    setPlacing(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <h1 className="text-3xl font-bold text-center mb-2">
        Beginner — Your First Stock
      </h1>
      <p className="text-center text-muted-foreground mb-6">
        מדריך ידידותי לקניית המניה הראשונה שלך
      </p>
      <Stepper step={step} />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">
            {step === 1 && "מה זה מניה ומה צריך?"}
            {step === 2 && "בחירת ברוקר"}
            {step === 3 && "בחירת מניה התחלתית"}
            {step === 4 && "הגדרת סכום קנייה"}
            {step === 5 && "סימולציה והתחברות"}
            {step === 6 && "סיכום"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <section className="space-y-3 text-sm text-muted-foreground">
              <p>
                מניה היא חלק קטן בבעלות על חברה. כדי לקנות מניה בפועל צריך חשבון
                השקעות אצל ברוקר או בנק.
              </p>
              <p>
                בתהליך הזה נעבור יחד שלב אחר שלב בקלות — עד לביצוע קנייה ראשונה
                (בדמו).
              </p>
              <div className="flex justify-end">
                <Button onClick={next}>התחל</Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-2">
              <Label>בחר ברוקר</Label>
              <Select
                value={values.broker}
                onValueChange={(v) =>
                  setValue("broker", v, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר ברוקר" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ibkr">Interactive Brokers</SelectItem>
                  <SelectItem value="tasty">Tastytrade</SelectItem>
                  <SelectItem value="alpaca">Alpaca</SelectItem>
                  <SelectItem value="bank">הבנק שלך</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-between pt-2">
                <Button variant="secondary" onClick={prev}>
                  חזרה
                </Button>
                <Button onClick={next} disabled={!values.broker}>
                  המשך
                </Button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-2">
              <Label>בחר מניה להתחלה</Label>
              <Select
                value={values.symbol}
                onValueChange={(v) =>
                  setValue("symbol", v, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר מניה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AAPL">AAPL — Apple</SelectItem>
                  <SelectItem value="MSFT">MSFT — Microsoft</SelectItem>
                  <SelectItem value="VOO">VOO — S&P 500 ETF</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-between pt-2">
                <Button variant="secondary" onClick={prev}>
                  חזרה
                </Button>
                <Button onClick={next} disabled={!values.symbol}>
                  המשך
                </Button>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-2">
              <Label>סכום קנייה (USD)</Label>
              <Input
                type="number"
                value={values.amount}
                onChange={(e) =>
                  setValue("amount", Number(e.target.value), {
                    shouldValidate: true,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                טיפ: התחל מסכום קטן כדי ללמוד בנחת.
              </p>
              <div className="flex justify-between pt-2">
                <Button variant="secondary" onClick={prev}>
                  חזרה
                </Button>
                <Button onClick={next} disabled={!values.amount}>
                  המשך
                </Button>
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-4">
              <div className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">פקודה משוערת</span>
                  <span className="font-medium">
                    {values.symbol} — ${values.amount}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>יצירת חשבון (דמו)</Label>
                  <Button
                    onClick={onCreate}
                    disabled={creating || !values.broker}
                  >
                    {creating ? "יוצר..." : "צור חשבון דמו"}
                  </Button>
                  {note && <p className="text-xs text-green-600">{note}</p>}
                </div>
                <div className="space-y-2">
                  <Label>ביצוע קנייה (דמו)</Label>
                  <Button
                    onClick={onPlace}
                    disabled={placing || !values.symbol || !values.amount}
                  >
                    {placing ? "מבצע..." : "בצע קנייה דמו"}
                  </Button>
                  {receipt && (
                    <p className="text-xs">
                      בוצע דמו: {receipt.symbol} בכ-{receipt.priceFilled}$ עבור{" "}
                      {receipt.amount}$
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setStep(6)} disabled={!note || !receipt}>
                  המשך לסיכום
                </Button>
              </div>
            </section>
          )}

          {step === 6 && (
            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <SummaryRow label="ברוקר" value={values.broker} />
                <SummaryRow label="מניה" value={values.symbol} />
                <SummaryRow label="סכום" value={`$${values.amount}`} />
                <SummaryRow
                  label="סטטוס דמו"
                  value={note ? "חשבון מוכן" : "טרם נוצר"}
                />
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                יפה! עכשיו תוכל לעבור לחשבון אמיתי אצל הברוקר שבחרת, ולהשתמש
                באותו תהליך. נוכל בהמשך לחבר OAuth/מפתחות API.
              </p>
              <div className="flex justify-end">
                <Button onClick={() => setStep(1)} variant="secondary">
                  התחל מחדש
                </Button>
              </div>
            </section>
          )}
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
