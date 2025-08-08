import { TradingCard } from "./TradingCard";
import { TradingButton } from "./TradingButton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  aiRecommendation?: "buy" | "sell" | "hold";
  aiConfidence?: number;
}

export function StockCard({ 
  symbol, 
  name, 
  price, 
  change, 
  changePercent,
  aiRecommendation,
  aiConfidence 
}: StockCardProps) {
  const isPositive = change >= 0;
  
  const getRecommendationColor = (rec?: string) => {
    switch (rec) {
      case "buy": return "text-success";
      case "sell": return "text-danger";
      default: return "text-warning";
    }
  };

  return (
    <TradingCard variant="gradient" className="relative">
      <div className="space-y-4">
        {/* Stock Info */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">{symbol}</h3>
            <p className="text-sm text-muted-foreground truncate">{name}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-foreground">${price.toFixed(2)}</p>
            <div className={cn("flex items-center gap-1 text-sm", isPositive ? "text-success" : "text-danger")}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isPositive ? "+" : ""}{change.toFixed(2)} ({changePercent.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        {aiRecommendation && (
          <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">המלצת AI</span>
              <span className="text-xs text-muted-foreground">
                ביטחון: {aiConfidence || 75}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold capitalize", getRecommendationColor(aiRecommendation))}>
                {aiRecommendation === "buy" ? "קנייה" : 
                 aiRecommendation === "sell" ? "מכירה" : "החזקה"}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <TradingButton variant="success" size="sm" className="flex-1">
            קנה
          </TradingButton>
          <TradingButton variant="danger" size="sm" className="flex-1">
            מכור
          </TradingButton>
        </div>
      </div>
    </TradingCard>
  );
}