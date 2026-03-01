import { Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useWatchlist } from "@/hooks/useApi";
import { useNavigate } from "react-router-dom";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

// helper to normalize returned data
interface APIItem {
  symbol: string;
  price?: string;
  percent_change?: string;
  CurrentPrice?: string;
  PercentChange?: string;
}

function normalize(items: any[]): Array<{
  symbol: string;
  price: string;
  change: string;
  positive: boolean;
}> {
  return items.map((item: APIItem) => {
    const priceValue = parseFloat(item.price || item.CurrentPrice || "0");
    const changeValue = parseFloat(item.percent_change || item.PercentChange || "0");
    return {
      symbol: item.symbol || "N/A",
      price: `$${priceValue.toFixed(2)}`,
      change: `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)}%`,
      positive: changeValue >= 0,
    };
  });
}


export function WatchlistPreview() {
  const navigate = useNavigate();
  const { data, isLoading } = useWatchlist();

  const items = Array.isArray(data) ? normalize(data) : [];
  const preview = items.slice(0, 4);

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
        {isLoading && (
          <div className="px-4 py-3 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        )}
        {!isLoading && preview.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No items in watchlist
          </div>
        )}
        {!isLoading &&
          preview.map((item) => (
            <div
              key={item.symbol}
              className="px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/watchlist`)}
            >
              <div className="flex items-center gap-2">
                <FavoriteButton symbol={item.symbol} />
                <div>
                  <div className="font-mono text-sm font-medium text-foreground">
                    {item.symbol}
                  </div>
                </div>
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
