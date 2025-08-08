// FinalConfirmDialog.tsx
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog"; // הנתיב שלך
import { Button } from "../ui/button";

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>אישור טרייד</DialogTitle>
          <DialogDescription>
            בדוק שהכל נראה תקין לפני שליחה לברוקר.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <div>
            <b>נכס:</b> {data.symbol}
          </div>
          <div>
            <b>מתנדים:</b> {data.indicators?.join(", ")}
          </div>
          <div>
            <b>סכום:</b> ${data.amount}
          </div>
          <div>
            <b>מקס׳ הפסד:</b> ${data.maxLoss}
          </div>
          <div>
            <b>ברוקר:</b> {data.broker?.name}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">בטל</Button>
          </DialogClose>
          <Button onClick={onConfirm}>אשר ושלח</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
