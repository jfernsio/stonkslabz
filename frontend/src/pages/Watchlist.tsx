
import { useState } from "react";
import { Star, Plus, ArrowUpRight, ArrowDownRight, Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWatchlist, useAddToWatchlist } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface WatchlistItem {
  symbol: string;
  name?: string;
  price?: string;
  CurrentPrice?: string;
  percent_change?: string;
  PercentChange?: string;
  positive?: boolean;
  alert?: boolean;
}

export default function Watchlist() {
  const [view, setView] = useState<"table" | "cards">("table");
  const { toast } = useToast();
  const navigate = useNavigate();

  // TanStack Query hooks for data fetching
  const { data: watchlistData, isLoading, error } = useWatchlist();
  const addToWatchlist = useAddToWatchlist();

  // Parse watchlist data from backend
  // API returns array directly: [{symbol, price, percent_change}, ...]
  const watchlistItems: WatchlistItem[] = Array.isArray(watchlistData) 
    ? watchlistData.map((item: WatchlistItem) => {
        const priceValue = parseFloat(item.price || item.CurrentPrice || "0");
        const changeValue = parseFloat(item.percent_change || item.PercentChange || "0");
        
        return {
          symbol: item.symbol || "N/A",
          name: item.name || item.symbol || "Unknown",
          price: `$${priceValue.toFixed(2)}`,
          change: `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)}%`,
          positive: changeValue >= 0,
          alert: false,
        };
      })
    : [];

  const handleAddToWatchlist = async (symbol: string) => {
    try {
      await addToWatchlist.mutateAsync(symbol);
      toast({
        title: "Success",
        description: `${symbol} added to watchlist`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add to watchlist",
        variant: "destructive",
      });
    }
  };

  // Check for errors
  const isError = error || (watchlistData && typeof watchlistData === 'object' && 'error' in watchlistData);
  const errorMessage = isError ? (watchlistData as any)?.error || "Failed to load watchlist" : "";

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Watchlist</h1>
            <p className="text-sm text-muted-foreground">Loading watchlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Watchlist</h1>
          <p className="text-sm text-muted-foreground">Track your favorite assets</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-sm p-1">
            <button
              onClick={() => setView("table")}
              className={cn(
                "px-3 py-1 text-xs rounded-sm transition-colors",
                view === "table" ? "bg-card text-foreground" : "text-muted-foreground"
              )}
            >
              Table
            </button>
            <button
              onClick={() => setView("cards")}
              className={cn(
                "px-3 py-1 text-xs rounded-sm transition-colors",
                view === "cards" ? "bg-card text-foreground" : "text-muted-foreground"
              )}
            >
              Cards
            </button>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => handleAddToWatchlist("AAPL")}>
            <Plus className="w-4 h-4 mr-1" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {isError && (
        <div className="terminal-card p-4 border-destructive/50">
          <p className="text-destructive text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Watchlist Content */}
      {watchlistItems.length === 0 && !isError ? (
        <div className="terminal-card p-8 text-center">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No items in watchlist</h3>
          <p className="text-sm text-muted-foreground mb-4">Add stocks to your watchlist to track them here.</p>
          <Button onClick={() => handleAddToWatchlist("AAPL")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Stock
          </Button>
        </div>
      ) : view === "table" ? (
        <div className="terminal-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Symbol</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Change</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alert</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {watchlistItems.map((item) => (
                <tr key={item.symbol} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-sm flex items-center justify-center",
                          item.positive ? "bg-success/10" : "bg-destructive/10"
                        )}
                      >
                        <Star className={cn("w-4 h-4", item.positive ? "text-success" : "text-destructive")} />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-medium text-foreground">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground">{item.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{item.price}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-mono text-sm",
                        item.positive ? "text-success" : "text-destructive"
                      )}
                    >
                      {item.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {item.change}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-8 w-8", item.alert && "text-warning")}
                    >
                      <Bell className="w-4 h-4" />
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/trade?symbol=${item.symbol}&type=stock`)}>
                        Trade
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlistItems.map((item) => (
            <div
              key={item.symbol}
              className="terminal-card p-4 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden"
              onClick={() => navigate(`/trade?symbol=${item.symbol}&type=stock`)}
            >
              <div
                className={cn(
                  "absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20",
                  item.positive ? "bg-success" : "bg-destructive"
                )}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-sm flex items-center justify-center",
                        item.positive ? "bg-success/10" : "bg-destructive/10"
                      )}
                    >
                      <Star className={cn("w-5 h-5", item.positive ? "text-success" : "text-destructive")} />
                    </div>
                    <div>
                      <div className="font-mono text-sm font-medium text-foreground">{item.symbol}</div>
                      <div className="text-xs text-muted-foreground">{item.name}</div>
                    </div>
                  </div>
                  {item.alert && <Bell className="w-4 h-4 text-warning" />}
                </div>
                <div className="flex items-end justify-between">
                  <div className="font-mono text-xl font-semibold text-foreground">{item.price}</div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-mono text-sm",
                      item.positive ? "text-success" : "text-destructive"
                    )}
                  >
                    {item.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {item.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

