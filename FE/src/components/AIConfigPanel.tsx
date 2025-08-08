import { TradingCard } from "./TradingCard";
import { TradingButton } from "./TradingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Brain, DollarSign, Target, AlertTriangle } from "lucide-react";
import { useState } from "react";

export function AIConfigPanel() {
  const [maxLoss, setMaxLoss] = useState([1000]);
  const [maxProfit, setMaxProfit] = useState([2000]);
  const [riskLevel, setRiskLevel] = useState([5]);
  const [autoTrade, setAutoTrade] = useState(false);

  return (
    <TradingCard title="הגדרות AI" variant="gradient" className="col-span-1">
      <div className="space-y-6">
        {/* Risk Management */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-semibold">ניהול סיכונים</h4>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">מקסימום הפסד לטרייד ($)</Label>
            <div className="px-3">
              <Slider
                value={maxLoss}
                onValueChange={setMaxLoss}
                max={5000}
                min={100}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$100</span>
                <span className="font-medium">${maxLoss[0]}</span>
                <span>$5,000</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">יעד רווח לטרייד ($)</Label>
            <div className="px-3">
              <Slider
                value={maxProfit}
                onValueChange={setMaxProfit}
                max={10000}
                min={200}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$200</span>
                <span className="font-medium">${maxProfit[0]}</span>
                <span>$10,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Level */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Target className="w-5 h-5" />
            <h4 className="font-semibold">רמת סיכון</h4>
          </div>
          <div className="px-3">
            <Slider
              value={riskLevel}
              onValueChange={setRiskLevel}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>שמרני</span>
              <span className="font-medium">{riskLevel[0]}/10</span>
              <span>אגרסיבי</span>
            </div>
          </div>
        </div>

        {/* Broker Selection */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">בית השקעות</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="בחר בית השקעות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ib">Interactive Brokers</SelectItem>
              <SelectItem value="excellence">Excellence</SelectItem>
              <SelectItem value="ibi">IBI</SelectItem>
              <SelectItem value="leumi">בנק לאומי</SelectItem>
              <SelectItem value="hapoalim">בנק הפועלים</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AI Instructions */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">הוראות נוספות ל-AI</Label>
          <Textarea 
            placeholder="לדוגמה: התמקד במניות טכנולוגיה, הימנע ממניות עם נפח מסחר נמוך..."
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Auto Trading Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/30">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">מסחר אוטומטי</p>
              <p className="text-xs text-muted-foreground">AI יבצע טרייד באופן עצמאי</p>
            </div>
          </div>
          <Switch 
            checked={autoTrade} 
            onCheckedChange={setAutoTrade}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <TradingButton variant="primary" className="w-full">
            שמור הגדרות
          </TradingButton>
          <TradingButton variant="secondary" className="w-full">
            איפוס להגדרות ברירת מחדל
          </TradingButton>
        </div>
      </div>
    </TradingCard>
  );
}