import { useState } from "react";
import { TradingCard } from "@/components/TradingCard";
import { TradingButton } from "@/components/TradingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { TrendingUp, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log("Auth attempt:", { email, password, isLogin });
  };

  return (
    <Layout showHeader={false}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 glow-primary">
              <TrendingUp className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">AI Trader</h1>
            <p className="text-muted-foreground">
              {isLogin ? "התחבר לחשבון שלך" : "צור חשבון חדש"}
            </p>
          </div>

          {/* Login Form */}
          <TradingCard variant="gradient">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">אימייל</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">סיסמה</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 pl-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Register only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">אימות סיסמה</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <TradingButton type="submit" variant="primary" className="w-full">
                {isLogin ? "התחבר" : "הירשם"}
              </TradingButton>

              {/* Forgot Password (Login only) */}
              {isLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary-glow transition-smooth"
                  >
                    שכחת סיסמה?
                  </button>
                </div>
              )}
            </form>
          </TradingCard>

          {/* Toggle Login/Register */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              {isLogin ? "אין לך חשבון?" : "יש לך כבר חשבון?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-primary-glow font-semibold mr-2 transition-smooth"
              >
                {isLogin ? "הירשם" : "התחבר"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}