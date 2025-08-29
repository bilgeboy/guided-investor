import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function toISODate(d?: Date | null) {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseISODate(s?: string) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function DateField({
  label,
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const selected = parseISODate(value);

  return (
    <div className="space-y-1">
      <Label className="flex items-center gap-2">{label}</Label>
      <div className="flex gap-2">
        {/* קלט ידני */}
        <Input
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {/* בחירה עם לוח שנה */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="shrink-0">
              <CalendarIcon className="h-4 w-4 mr-2" />
              בחר
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-2">
            <Calendar
              mode="single"
              selected={selected ?? undefined}
              onSelect={(d) => onChange(toISODate(d))}
              fromYear={1990}
              toYear={2100}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <p className="text-xs text-muted-foreground">
        אפשר להקליד ידנית או לבחור מהלוח.
      </p>
    </div>
  );
}
