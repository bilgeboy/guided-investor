import { Layout } from "@/components/Layout";
import { TradingCard } from "@/components/TradingCard";
import { TradingButton } from "@/components/TradingButton";
import { StockCard } from "@/components/StockCard";
import { AIConfigPanel } from "@/components/AIConfigPanel";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { Activity, Brain, Target, AlertCircle } from "lucide-react";

// Mock data for demonstration
const mockStocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 195.84,
    change: 2.45,
    changePercent: 1.27,
    aiRecommendation: "buy" as const,
    aiConfidence: 85,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 875.2,
    change: -12.3,
    changePercent: -1.39,
    aiRecommendation: "hold" as const,
    aiConfidence: 72,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 420.15,
    change: 5.67,
    changePercent: 1.37,
    aiRecommendation: "buy" as const,
    aiConfidence: 90,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 245.67,
    change: -8.92,
    changePercent: -3.51,
    aiRecommendation: "sell" as const,
    aiConfidence: 78,
  },
];

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            ברוך הבא לדשבורד הטרייד שלך
          </h1>
          <p className="text-xl text-muted-foreground">
            נהל את הפורטפוליו שלך עם כוח ה-AI המתקדם ביותר
          </p>
        </div>

        {/* Portfolio Overview */}
        <PortfolioOverview />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Configuration Panel */}
          <AIConfigPanel />

          {/* Center Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Status */}
            <TradingCard title="סטטוס AI" variant="gradient">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      AI פעיל ומעקב
                    </p>
                    <p className="text-sm text-muted-foreground">
                      מנתח 847 מניות | עודכן לפני 2 דקות
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <TradingButton variant="secondary" size="sm">
                    השהה
                  </TradingButton>
                  <TradingButton variant="primary" size="sm">
                    הגדרות
                  </TradingButton>
                </div>
              </div>
            </TradingCard>

            {/* Recent Activity */}
            <TradingCard title="פעילות אחרונה" variant="gradient">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium text-foreground">קנייה: AAPL</p>
                      <p className="text-sm text-muted-foreground">
                        5 מניות ב-$195.84
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    לפני 5 דקות
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-danger/10 border border-danger/20">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-danger" />
                    <div>
                      <p className="font-medium text-foreground">מכירה: TSLA</p>
                      <p className="text-sm text-muted-foreground">
                        3 מניות ב-$245.67
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    לפני 12 דקות
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-medium text-foreground">התראה: NVDA</p>
                      <p className="text-sm text-muted-foreground">
                        ירידת מחיר משמעותית
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    לפני 18 דקות
                  </span>
                </div>
              </div>
            </TradingCard>
          </div>
        </div>

        {/* Stock Watchlist */}
        <TradingCard title="רשימת מעקב AI" variant="gradient">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockStocks.map((stock) => (
              <StockCard key={stock.symbol} {...stock} />
            ))}
          </div>
        </TradingCard>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <TradingButton variant="primary">
            <Target className="w-4 h-4 mr-2" />
            הוסף מניה לרשימה
          </TradingButton>
          <TradingButton variant="secondary">
            <Brain className="w-4 h-4 mr-2" />
            כוונן AI
          </TradingButton>
          <TradingButton variant="secondary">
            <Activity className="w-4 h-4 mr-2" />
            היסטוריית טרייד
          </TradingButton>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
