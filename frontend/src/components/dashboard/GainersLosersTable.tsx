import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Stock {
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
}

interface GainersLosersTableProps {
  title: string;
  stocks: Stock[];
  type: "gainers" | "losers";
}

export function GainersLosersTable({ title, stocks, type }: GainersLosersTableProps) {
  return (
    <div className="terminal-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-sm font-mono",
            type === "gainers"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {type === "gainers" ? "↑ TOP" : "↓ BOTTOM"}
        </span>
      </div>
      <div className="divide-y divide-border/50">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="px-4 py-2.5 flex items-center justify-between hover:bg-accent/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center">
                <span className="font-mono text-xs text-muted-foreground">
                  {stock.symbol.slice(0, 2)}
                </span>
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">{stock.symbol}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {stock.name}
                </div>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              <div>
                <div className="font-mono text-sm text-foreground">{stock.price}</div>
                <div
                  className={cn(
                    "font-mono text-xs flex items-center justify-end gap-0.5",
                    stock.positive ? "text-success" : "text-destructive"
                  )}
                >
                  {stock.positive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stock.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
