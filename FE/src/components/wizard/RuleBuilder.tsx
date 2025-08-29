// src/components/wizard/StockRuleBuilder.tsx
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import { IndicatorTypes, Operators } from "./indicatorSchema";

export default function RuleBuilder({ stockIndex }: { stockIndex: number }) {
  const { control, watch, setValue } = useFormContext<any>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `stocks.${stockIndex}.entry_rules`,
  });

  const rulesWatch = watch(`stocks.${stockIndex}.entry_rules`);

  const addPreset = () =>
    append({
      indicator: "rsi",
      params: { period: 14, source: "close" },
      operator: "crossesBelow",
      value: 30,
      compareTo: "none",
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">קריטריונים (Rules)</h3>
        <div className="flex gap-2">{/* כאן אפשר לשים כפתורי presets */}</div>
      </div>

      {fields.map((f, idx) => {
        const rule = rulesWatch[idx];
        return (
          <Card key={f.id} className="border">
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-3 gap-3 w-full md:w-2/3">
                  <div>
                    <Label>אינדיקטור</Label>
                    <Select
                      value={rule.indicator}
                      onValueChange={(v) =>
                        setValue(
                          `stocks.${stockIndex}.entry_rules.${idx}.indicator`,
                          v as any,
                          {
                            shouldValidate: true,
                          }
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר" />
                      </SelectTrigger>
                      <SelectContent>
                        {IndicatorTypes.map((i) => (
                          <SelectItem key={i} value={i}>
                            {i.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operator */}
                  <div>
                    <Label>תנאי</Label>
                    <Select
                      value={rule.operator}
                      onValueChange={(v) =>
                        setValue(
                          `stocks.${stockIndex}.entry_rules.${idx}.operator`,
                          v as any,
                          {
                            shouldValidate: true,
                          }
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר" />
                      </SelectTrigger>
                      <SelectContent>
                        {Operators.map((op) => (
                          <SelectItem key={op} value={op}>
                            {op}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button variant="ghost" onClick={() => remove(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Params */}
              <IndicatorParams idx={idx} stockIndex={stockIndex} />

              {/* Threshold / Compare */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(rule.indicator === "rsi" ||
                  rule.indicator === "cci" ||
                  rule.indicator === "bbands") && (
                  <div>
                    <Label>ערך/סף</Label>
                    <Input
                      type="number"
                      value={rule.value ?? ""}
                      onChange={(e) =>
                        setValue(
                          `stocks.${stockIndex}.entry_rules.${idx}.value`,
                          Number(e.target.value)
                        )
                      }
                      placeholder={
                        rule.indicator === "rsi" ? "לדוג׳ 30 או 70" : "ערך סף"
                      }
                    />
                  </div>
                )}

                {(rule.indicator === "sma" || rule.indicator === "ema") && (
                  <>
                    <div>
                      <Label>השוואה ל־</Label>
                      <Select
                        value={rule.compareTo ?? "price"}
                        onValueChange={(v) =>
                          setValue(
                            `stocks.${stockIndex}.entry_rules.${idx}.compareTo`,
                            v as any
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="בחר" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price">מחיר</SelectItem>
                          <SelectItem value="sma">SMA</SelectItem>
                          <SelectItem value="ema">EMA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(rule.compareTo === "sma" || rule.compareTo === "ema") && (
                      <div>
                        <Label>תקופת MA להשוואה</Label>
                        <Input
                          type="number"
                          value={rule.comparePeriod ?? 50}
                          onChange={(e) =>
                            setValue(
                              `stocks.${stockIndex}.entry_rules.${idx}.comparePeriod`,
                              Number(e.target.value)
                            )
                          }
                          placeholder="למשל 50"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button
        variant="default"
        onClick={() =>
          append({
            indicator: "rsi",
            params: { period: 14, source: "close" },
            operator: "crossesAbove",
            value: 70,
            compareTo: "none",
          })
        }
      >
        <Plus className="h-4 w-4 mr-1" /> הוסף חוק
      </Button>
    </div>
  );
}

/* --------- פרמטרים דינמיים לפי אינדיקטור --------- */
function IndicatorParams({
  idx,
  stockIndex,
}: {
  idx: number;
  stockIndex: number;
}) {
  const { watch, setValue } = useFormContext<any>();
  const rule = watch(`stocks.${stockIndex}.entry_rules.${idx}`);

  // ה־params כמו קודם, רק עם path מותאם ל-stocks
  if (
    rule.indicator === "rsi" ||
    rule.indicator === "cci" ||
    rule.indicator === "sma" ||
    rule.indicator === "ema"
  ) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>תקופה</Label>
          <Input
            type="number"
            value={
              rule.params?.period ??
              (rule.indicator === "rsi"
                ? 14
                : rule.indicator === "cci"
                ? 20
                : 50)
            }
            onChange={(e) =>
              setValue(
                `stocks.${stockIndex}.entry_rules.${idx}.params.period`,
                Number(e.target.value)
              )
            }
          />
        </div>
        <div>
          <Label>מקור</Label>
          <Select
            value={rule.params?.source ?? "close"}
            onValueChange={(v) =>
              setValue(
                `stocks.${stockIndex}.entry_rules.${idx}.params.source`,
                v as any
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="close" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="close">close</SelectItem>
              <SelectItem value="open">open</SelectItem>
              <SelectItem value="high">high</SelectItem>
              <SelectItem value="low">low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (rule.indicator === "macd") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Label>Fast</Label>
          <Input
            type="number"
            value={rule.params?.fast ?? 12}
            onChange={(e) =>
              setValue(
                `stocks.${stockIndex}.entry_rules.${idx}.params.fast`,
                Number(e.target.value)
              )
            }
          />
        </div>
        <div>
          <Label>Slow</Label>
          <Input
            type="number"
            value={rule.params?.slow ?? 26}
            onChange={(e) =>
              setValue(
                `stocks.${stockIndex}.entry_rules.${idx}.params.slow`,
                Number(e.target.value)
              )
            }
          />
        </div>
        <div>
          <Label>Signal</Label>
          <Input
            type="number"
            value={rule.params?.signal ?? 9}
            onChange={(e) =>
              setValue(
                `stocks.${stockIndex}.entry_rules.${idx}.params.signal`,
                Number(e.target.value)
              )
            }
          />
        </div>
        <div>
          <Label>מקור</Label>
          <Select
            value={rule.params?.source ?? "close"}
            onValueChange={(v) =>
              setValue(
                `stocks.${stockIndex}.entry_rules.${idx}.params.source`,
                v as any
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="close" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="close">close</SelectItem>
              <SelectItem value="open">open</SelectItem>
              <SelectItem value="high">high</SelectItem>
              <SelectItem value="low">low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (rule.indicator === "bbands") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>תקופה</Label>
          <Input
            type="number"
            value={rule.params?.period ?? 20}
            onChange={(e) =>
              setValue(
                `stocks.${stockIndex}.entry_rules.${idx}.params.period`,
                Number(e.target.value)
              )
            }
          />
        </div>
        <div>
          <Label>סטיות תקן</Label>
          <Input
            type="number"
            value={rule.params?.stddev ?? 2}
            onChange={(e) =>
              setValue(
                `stocks.${stockIndex}.entry_rules.${idx}.params.stddev`,
                Number(e.target.value)
              )
            }
          />
        </div>
        <div>
          <Label>מקור</Label>
          <Select
            value={rule.params?.source ?? "close"}
            onValueChange={(v) =>
              setValue(
                `stocks.${stockIndex}.entry_rules.${idx}.params.source`,
                v as any
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="close" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="close">close</SelectItem>
              <SelectItem value="open">open</SelectItem>
              <SelectItem value="high">high</SelectItem>
              <SelectItem value="low">low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return null;
}
