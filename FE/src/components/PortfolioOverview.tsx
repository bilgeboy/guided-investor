import { TradingCard } from "./TradingCard";
import { DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import api from "../api/axiosInstance"; // adjust path as needed
import useStockPrice from "@/hooks/useStockPrice";

interface PortfolioStats {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  totalProfit: number;
  totalProfitPercent: number;
  activePositions: number;
}

const mockStats: PortfolioStats = {
  totalValue: 45250.3,
  dailyChange: 1250.75,
  dailyChangePercent: 2.84,
  totalProfit: 8750.3,
  totalProfitPercent: 24.1,
  activePositions: 7,
};

export function PortfolioOverview() {
  const isDailyPositive = mockStats.dailyChange >= 0;
  const isTotalPositive = mockStats.totalProfit >= 0;

  const price = useStockPrice("AAPL");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Portfolio Value */}
      <TradingCard variant="gradient">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">סך הפורטפוליו</p>
            <p className="text-2xl font-bold text-foreground">
              ${mockStats.totalValue.toLocaleString()}
            </p>
          </div>
        </div>
      </TradingCard>

      {/* Daily Change */}
      <TradingCard variant="gradient">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isDailyPositive ? "bg-success/20" : "bg-danger/20"
            )}
          >
            {isDailyPositive ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-danger" />
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">שינוי יומי</p>
            <p
              className={cn(
                "text-2xl font-bold",
                isDailyPositive ? "text-success" : "text-danger"
              )}
            >
              {isDailyPositive ? "+" : ""}$
              {Math.abs(mockStats.dailyChange).toLocaleString()}
            </p>
            <p
              className={cn(
                "text-sm",
                isDailyPositive ? "text-success" : "text-danger"
              )}
            >
              {isDailyPositive ? "+" : ""}
              {mockStats.dailyChangePercent}%
            </p>
          </div>
        </div>
      </TradingCard>

      {/* Total Profit/Loss */}
      <TradingCard variant="gradient">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isTotalPositive ? "bg-success/20" : "bg-danger/20"
            )}
          >
            {isTotalPositive ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-danger" />
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">סך רווח/הפסד</p>
            <p
              className={cn(
                "text-2xl font-bold",
                isTotalPositive ? "text-success" : "text-danger"
              )}
            >
              {isTotalPositive ? "+" : ""}$
              {Math.abs(mockStats.totalProfit).toLocaleString()}
            </p>
            <p
              className={cn(
                "text-sm",
                isTotalPositive ? "text-success" : "text-danger"
              )}
            >
              {isTotalPositive ? "+" : ""}
              {mockStats.totalProfitPercent}%
            </p>
          </div>
        </div>
      </TradingCard>

      {/* Active Positions */}
      <TradingCard variant="gradient">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
            <PieChart className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">פוזיציות פעילות</p>
            <p className="text-2xl font-bold text-foreground">
              {mockStats.activePositions}
            </p>
          </div>
        </div>
      </TradingCard>

      <TradingCard variant="gradient">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
            <PieChart className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">My Touch</p>
            <p className="text-2xl font-bold text-foreground">
              {price ?? "טוען..."}
            </p>
          </div>
        </div>
      </TradingCard>
    </div>
  );
}
