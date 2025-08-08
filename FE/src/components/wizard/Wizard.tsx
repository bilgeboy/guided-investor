// Wizard.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FinalConfirmDialog from "./FinalConfirmDialog";

const Schema = z.object({
  symbol: z.string().min(1),
  indicators: z.array(z.string()).min(1),
  amount: z.number().positive(),
  maxLoss: z.number().positive(),
  broker: z.object({
    name: z.string(),
    apiKey: z.string().optional(),
  }),
});
type FormData = z.infer<typeof Schema>;

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [openConfirm, setOpenConfirm] = useState(false);
  const { register, handleSubmit, formState, setValue, watch } =
    useForm<FormData>({
      resolver: zodResolver(Schema),
      defaultValues: { indicators: [], broker: { name: "" } },
    });

  const onReview = handleSubmit(() => setOpenConfirm(true));

  return (
    <div className="mx-auto max-w-2xl p-4">
      {/* Stepper */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`px-3 py-1 rounded ${
              s <= step ? "bg-primary text-white" : "bg-muted"
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* שלב 1: מתנדים */}
      {step === 1 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">בחר מתנדים</h2>
          <label className="flex items-center gap-2">
            <input type="checkbox" value="rsi" {...register("indicators")} />{" "}
            RSI
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" value="macd" {...register("indicators")} />{" "}
            MACD
          </label>
          <div className="flex justify-end">
            <button className="btn" onClick={() => setStep(2)}>
              המשך
            </button>
          </div>
        </section>
      )}

      {/* שלב 2: חיפוש נכס */}
      {step === 2 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">חפש מניה/נכס</h2>
          <input className="input" placeholder="AAPL" {...register("symbol")} />
          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              חזרה
            </button>
            <button className="btn" onClick={() => setStep(3)}>
              המשך
            </button>
          </div>
        </section>
      )}

      {/* שלב 3: סכום וסיכון */}
      {step === 3 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">סכום וסיכון</h2>
          <input
            type="number"
            className="input"
            placeholder="Amount $"
            {...register("amount", { valueAsNumber: true })}
          />
          <input
            type="number"
            className="input"
            placeholder="Max Loss $"
            {...register("maxLoss", { valueAsNumber: true })}
          />
          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(2)}>
              חזרה
            </button>
            <button className="btn" onClick={() => setStep(4)}>
              המשך
            </button>
          </div>
        </section>
      )}

      {/* שלב 4: ברוקר */}
      {step === 4 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">חיבור לברוקר</h2>
          <select className="input" {...register("broker.name")}>
            <option value="">בחר ברוקר</option>
            <option value="ibkr">Interactive Brokers</option>
            <option value="etoro">eToro</option>
          </select>
          <input
            className="input"
            placeholder="API Key (אם נדרש)"
            {...register("broker.apiKey")}
          />
          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(3)}>
              חזרה
            </button>
            <button className="btn" onClick={() => setStep(5)}>
              המשך
            </button>
          </div>
        </section>
      )}

      {/* שלב 5: סקירה + פתיחת Dialog לאישור */}
      {step === 5 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">סקירת ההגדרות</h2>
          <pre className="bg-muted p-3 rounded text-sm">
            {JSON.stringify(watch(), null, 2)}
          </pre>
          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(4)}>
              חזרה
            </button>
            <button className="btn-primary" onClick={onReview}>
              אישור סופי
            </button>
          </div>
        </section>
      )}

      <FinalConfirmDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        data={watch()}
        onConfirm={() => {
          /* קריאה ל-API לפתיחת הטרייד */
        }}
      />
    </div>
  );
}
