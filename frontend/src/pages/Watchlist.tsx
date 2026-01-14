import { useState } from "react";
import { Star, Plus, ArrowUpRight, ArrowDownRight, Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const watchlistData = [
  { symbol: "AAPL", name: "Apple Inc.", price: "$233.16", change: "+1.54%", positive: true, alert: true },
  { symbol: "MSFT", name: "Microsoft Corp", price: "$520.42", change: "-0.24%", positive: false, alert: false },
  { symbol: "GOOGL", name: "Alphabet Inc", price: "$201.56", change: "+2.65%", positive: true, alert: true },
  { symbol: "AMZN", name: "Amazon.com Inc", price: "$244.16", change: "-1.53%", positive: false, alert: false },
  { symbol: "TSLA", name: "Tesla Inc.", price: "$339.62", change: "+1.72%", positive: true, alert: true },
  { symbol: "NVDA", name: "NVIDIA Corp", price: "$181.46", change: "+2.21%", positive: true, alert: false },
  { symbol: "META", name: "Meta Platforms", price: "$762.96", change: "-2.54%", positive: false, alert: false },
  { symbol: "BTC", name: "Bitcoin", price: "$67,234.50", change: "+3.21%", positive: true, alert: true },
  { symbol: "ETH", name: "Ethereum", price: "$3,456.78", change: "+2.15%", positive: true, alert: false },
];

export default function Watchlist() {
  const [view, setView] = useState<"table" | "cards">("table");

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
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Watchlist Content */}
      {view === "table" ? (
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
              {watchlistData.map((item) => (
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
                      <Button size="sm" variant="outline" className="h-7 text-xs">
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
          {watchlistData.map((item) => (
            <div
              key={item.symbol}
              className="terminal-card p-4 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden"
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
