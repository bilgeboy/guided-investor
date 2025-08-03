import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TradingCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "gradient";
}

export function TradingCard({ title, children, className, variant = "default" }: TradingCardProps) {
  const cardClasses = cn(
    "transition-smooth hover:scale-[1.02]",
    variant === "gradient" && "card-gradient border-border/50",
    className
  );

  return (
    <Card className={cardClasses}>
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : "p-6"}>
        {children}
      </CardContent>
    </Card>
  );
}