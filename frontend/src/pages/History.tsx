import { useState } from "react";
import { Calendar, Filter, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const tradeHistory = [
  { asset: "AAPL", type: "Buy", quantity: "10", price: "$233.16", total: "$2,331.60", date: "Jan 10, 2026", pnl: "+$45.30", pnlPercent: "+1.94%", profitable: true },
  { asset: "TSLA", type: "Sell", quantity: "5", price: "$339.62", total: "$1,698.10", date: "Jan 9, 2026", pnl: "+$123.50", pnlPercent: "+7.27%", profitable: true },
  { asset: "BTC", type: "Buy", quantity: "0.05", price: "$67,234.50", total: "$3,361.72", date: "Jan 8, 2026", pnl: "-$42.15", pnlPercent: "-1.25%", profitable: false },
  { asset: "NVDA", type: "Buy", quantity: "15", price: "$181.46", total: "$2,721.90", date: "Jan 7, 2026", pnl: "+$312.40", pnlPercent: "+11.48%", profitable: true },
  { asset: "ETH", type: "Sell", quantity: "0.5", price: "$3,456.78", total: "$1,728.39", date: "Jan 6, 2026", pnl: "+$89.20", pnlPercent: "+5.16%", profitable: true },
  { asset: "GOOGL", type: "Buy", quantity: "8", price: "$201.56", total: "$1,612.48", date: "Jan 5, 2026", pnl: "-$28.64", pnlPercent: "-1.78%", profitable: false },
  { asset: "MSFT", type: "Sell", quantity: "4", price: "$520.42", total: "$2,081.68", date: "Jan 4, 2026", pnl: "+$156.80", pnlPercent: "+7.54%", profitable: true },
  { asset: "AMD", type: "Buy", quantity: "20", price: "$156.78", total: "$3,135.60", date: "Jan 3, 2026", pnl: "+$234.50", pnlPercent: "+7.48%", profitable: true },
];

export default function History() {
  const [dateFilter, setDateFilter] = useState("");

  const totalPnL = tradeHistory.reduce((acc, trade) => {
    const value = parseFloat(trade.pnl.replace(/[^0-9.-]/g, ""));
    return acc + value;
  }, 0);

  const winRate = (tradeHistory.filter(t => t.profitable).length / tradeHistory.length * 100).toFixed(0);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Trade History</h1>
          <p className="text-sm text-muted-foreground">Your complete trading activity</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="terminal-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Trades</div>
          <div className="text-2xl font-semibold text-foreground font-mono">{tradeHistory.length}</div>
        </div>
        <div className="terminal-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Total P&L</div>
          <div className={cn(
            "text-2xl font-semibold font-mono",
            totalPnL >= 0 ? "text-success" : "text-destructive"
          )}>
            {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
          </div>
        </div>
        <div className="terminal-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
          <div className="text-2xl font-semibold text-success font-mono">{winRate}%</div>
        </div>
        <div className="terminal-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Volume</div>
          <div className="text-2xl font-semibold text-foreground font-mono">$18,671.47</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-9 bg-card border-border w-48"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* History Table */}
      <div className="terminal-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asset</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">P&L</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {tradeHistory.map((trade, index) => (
                <tr key={index} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-sm flex items-center justify-center",
                          trade.profitable ? "bg-success/10" : "bg-destructive/10"
                        )}
                      >
                        {trade.profitable ? (
                          <ArrowUpRight className="w-4 h-4 text-success" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <span className="font-mono text-sm font-medium text-foreground">{trade.asset}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-sm font-mono",
                        trade.type === "Buy"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{trade.quantity}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{trade.price}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{trade.total}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          "font-mono text-sm",
                          trade.profitable ? "text-success" : "text-destructive"
                        )}
                      >
                        {trade.pnl}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-xs",
                          trade.profitable ? "text-success/70" : "text-destructive/70"
                        )}
                      >
                        {trade.pnlPercent}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-muted-foreground">{trade.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
