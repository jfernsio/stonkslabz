import { cn } from "@/lib/utils";

interface MarketTickerProps {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  positive: boolean;
}

export function MarketTicker({
  symbol,
  name,
  price,
  change,
  changePercent,
  positive,
}: MarketTickerProps) {
  return (
    <div className="terminal-card p-3 flex items-center justify-between hover:border-primary/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-sm flex items-center justify-center font-mono text-xs font-bold",
            positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}
        >
          {symbol.slice(0, 3)}
        </div>
        <div>
          <div className="font-medium text-sm text-foreground">{symbol}</div>
          <div className="text-xs text-muted-foreground">{name}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm text-foreground">{price}</div>
        <div
          className={cn(
            "font-mono text-xs",
            positive ? "text-success" : "text-destructive"
          )}
        >
          {change} ({changePercent})
        </div>
      </div>
    </div>
  );
}
