import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    // ברירת מחדל: אם יש כבר class "dark" על <html>, נשארים בדארק
    return document.documentElement.classList.contains("dark");
  });

  // החלת הנושא ושמירה
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-1.5">
      <div className="flex items-center gap-2">
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <Label className="text-sm">Bright mode</Label>
      </div>
      <Switch checked={!isDark} onCheckedChange={(v) => setIsDark(!v)} />
    </div>
  );
}
