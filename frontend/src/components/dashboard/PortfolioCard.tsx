import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PortfolioCardProps {
  title: string;
  value: string;
  change?: string;
  changePercent?: string;
  positive?: boolean;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "success" | "destructive";
}

export function PortfolioCard({
  title,
  value,
  change,
  changePercent,
  positive = true,
  icon,
  variant = "default",
}: PortfolioCardProps) {
  return (
    <div
      className={cn(
        "terminal-card p-4 relative overflow-hidden",
        variant === "primary" && "border-primary/30",
        variant === "success" && "border-success/30",
        variant === "destructive" && "border-destructive/30"
      )}
    >
      {/* Glow effect */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10",
          variant === "primary" && "bg-primary",
          variant === "success" && "bg-success",
          variant === "destructive" && "bg-destructive",
          variant === "default" && "bg-secondary"
        )}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          {icon}
        </div>

        <div className="font-mono text-2xl font-semibold text-foreground mb-1">
          {value}
        </div>

        {(change || changePercent) && (
          <div className="flex items-center gap-2">
            {positive ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
            <span
              className={cn(
                "font-mono text-sm",
                positive ? "text-success" : "text-destructive"
              )}
            >
              {change && <span>{change}</span>}
              {changePercent && <span className="ml-1">({changePercent})</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
