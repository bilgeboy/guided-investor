import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, User, Settings, LogOut, Menu } from "lucide-react";
import { TradingButton } from "./TradingButton";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ThemeToggle from "./ThemeToggle";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function Layout({ children, showHeader = true }: LayoutProps) {
  if (!showHeader) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">AI Trader</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                דשבורד
              </Button>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                פורטפוליו
              </Button>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                היסטוריה
              </Button>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                תמחור
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Link to="/wizard">סוחר חכם</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Link to="/backtest-wizard">מסחר בק-טסט</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Link to="/beginner-wizard">קניה ראשונה</Link>
              </Button>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Appearance</DropdownMenuLabel>

                  {/* Bright/Dark toggle row */}
                  <ThemeToggle />

                  <DropdownMenuSeparator />
                  {/* אפשר להשאיר למעלה מקום לעוד הגדרות בעתיד */}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <User className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
