import { TradingCard } from "@/components/TradingCard";
import { TradingButton } from "@/components/TradingButton";
import { Layout } from "@/components/Layout";
import { Check, Star, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "בסיסי",
    price: "₪99",
    period: "לחודש",
    icon: Star,
    features: [
      "עד 10 טרייד בחודש",
      "המלצות AI בסיסיות",
      "חיבור לבית השקעות אחד",
      "היסטוריית טרייד בסיסית",
      "תמיכה באימייל"
    ],
    popular: false
  },
  {
    name: "מקצועי",
    price: "₪299",
    period: "לחודש",
    icon: Zap,
    features: [
      "טרייד בלתי מוגבל",
      "המלצות AI מתקדמות",
      "חיבור לכמה בתי השקעות",
      "ניתוח טכני מתקדם",
      "התראות זמן אמת",
      "היסטוריה מלאה",
      "תמיכה בטלפון"
    ],
    popular: true
  },
  {
    name: "פרימיום",
    price: "₪599",
    period: "לחודש",
    icon: Crown,
    features: [
      "כל מה שיש במקצועי",
      "מסחר אוטומטי מלא",
      "AI אישי מותאם",
      "ניתוח סנטימנט",
      "גישה ל-API",
      "יועץ אישי",
      "דוחות מותאמים אישית"
    ],
    popular: false
  }
];

export default function Pricing() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            בחר את התוכנית המתאימה לך
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            התחל עם AI Trader היום וקבל גישה למערכת הטרייד המתקדמת ביותר
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <TradingCard 
                key={plan.name} 
                variant="gradient" 
                className={plan.popular ? "ring-2 ring-primary glow-primary scale-105" : ""}
              >
                <div className="text-center space-y-6">
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium inline-block">
                      הכי פופולרי
                    </div>
                  )}

                  {/* Plan Icon */}
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>

                  {/* Plan Name */}
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 text-right">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <TradingButton 
                    variant={plan.popular ? "primary" : "secondary"} 
                    className="w-full"
                  >
                    {plan.popular ? "התחל עכשיו" : "בחר תוכנית"}
                  </TradingButton>
                </div>
              </TradingCard>
            );
          })}
        </div>

        {/* FAQ Section */}
        <TradingCard title="שאלות נפוצות" variant="gradient">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">איך עובד המסחר האוטומטי?</h4>
              <p className="text-muted-foreground">
                המערכת מקבלת נתוני שוק בזמן אמת, מנתחת אותם באמצעות AI מתקדם ומבצעת טרייד לפי ההגדרות שקבעת.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">אילו בתי השקעות נתמכים?</h4>
              <p className="text-muted-foreground">
                אנו תומכים ב-Interactive Brokers, Excellence, IBI, בנק לאומי, בנק הפועלים ועוד.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">האם יש תקופת ניסיון חינם?</h4>
              <p className="text-muted-foreground">
                כן! אנו מציעים 7 ימי ניסיון חינם לכל התוכניות עם גישה מלאה לכל התכונות.
              </p>
            </div>
          </div>
        </TradingCard>
      </div>
    </Layout>
  );
}