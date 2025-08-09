import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function FinalConfirmDialog({
  open,
  onOpenChange,
  data,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  data: any;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>אישור טרייד</DialogTitle>
          <DialogDescription>
            בדוק שהכל נכון לפני שליחה לברוקר.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <Row k="נכס" v={data.symbol} />
          <Row k="מתנדים" v={(data.indicators || []).join(", ")} />
          <div className="grid gap-2 md:grid-cols-2">
            <Row k="סכום ($)" v={String(data.amount)} />
            <Row k="מקס׳ הפסד ($)" v={String(data.maxLoss)} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Row k="ברוקר" v={data.broker?.name || "—"} />
            <Row
              k="API Key"
              v={data.broker?.apiKey ? mask(data.broker.apiKey) : "—"}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="secondary">בטל</Button>
          </DialogClose>
          <Button onClick={onConfirm}>אשר ושלח</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v || "—"}</span>
    </div>
  );
}

function mask(s: string) {
  if (!s) return "—";
  if (s.length <= 6) return "••••";
  return s.slice(0, 3) + "••••" + s.slice(-3);
}
