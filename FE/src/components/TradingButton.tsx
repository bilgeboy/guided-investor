import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TradingButtonProps {
  variant?: "primary" | "success" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function TradingButton({ 
  variant = "primary", 
  size = "md", 
  children, 
  className,
  onClick,
  disabled,
  type = "button"
}: TradingButtonProps) {
  const baseStyles = "transition-smooth font-semibold border-0 relative overflow-hidden";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-glow text-primary-foreground glow-primary",
    success: "bg-success hover:bg-success-glow text-success-foreground glow-success",
    danger: "bg-danger hover:bg-danger-glow text-danger-foreground glow-danger",
    secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-md",
    md: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-xl"
  };

  return (
    <Button
      type={type}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}