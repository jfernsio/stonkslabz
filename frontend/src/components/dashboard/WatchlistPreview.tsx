import { Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const watchlistItems = [
  { symbol: "AAPL", name: "Apple Inc.", price: "$233.16", change: "+1.54%", positive: true },
  { symbol: "NVDA", name: "NVIDIA Corp", price: "$181.46", change: "+2.21%", positive: true },
  { symbol: "TSLA", name: "Tesla Inc.", price: "$339.62", change: "-1.72%", positive: false },
  { symbol: "BTC", name: "Bitcoin", price: "$67,234.50", change: "+3.2%", positive: true },
];

export function WatchlistPreview() {
  return (
    <div className="terminal-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-warning" />
          <h3 className="font-semibold text-sm text-foreground">Watchlist</h3>
        </div>
        <Link
          to="/watchlist"
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="divide-y divide-border/50">
        {watchlistItems.map((item) => (
          <div
            key={item.symbol}
            className="px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors cursor-pointer"
          >
            <div>
              <div className="font-mono text-sm font-medium text-foreground">
                {item.symbol}
              </div>
              <div className="text-xs text-muted-foreground">{item.name}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm text-foreground">{item.price}</div>
              <div
                className={cn(
                  "font-mono text-xs flex items-center justify-end gap-0.5",
                  item.positive ? "text-success" : "text-destructive"
                )}
              >
                {item.positive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {item.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
