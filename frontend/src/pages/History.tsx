
import { useState } from "react";
import { Calendar, Filter, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useHistory } from "@/hooks/useApi";

interface TradeItem {
  asset: string;
  type: string;
  quantity: string;
  price: string;
  total: string;
  date: string;
  pnl: string;
  pnlPercent: string;
  profitable: boolean;
}

interface HistoryStats {
  total_trades: number;
  total_pnl: number;
  win_rate: number;
  total_volume: number;
}

interface Transaction {
  id: number;
  symbol: string;
  type: string;
  quantity: number;
  price: number;
  total_amount: number;
  realized_pn_l: number;
  created_at: string;
}

interface HistoryResponse {
  page: number;
  limit: number;
  stats: HistoryStats;
  transactions: Transaction[];
}

export default function History() {
  const [dateFilter, setDateFilter] = useState("");

  // TanStack Query hook for data fetching
  const { data: historyData, isLoading } = useHistory();

  // Parse history data from backend
  // API response: { page, limit, stats, transactions }
  const historyResponse = historyData as HistoryResponse | undefined;
  const transactions = historyResponse?.transactions || [];
  
  const tradeHistory: TradeItem[] = transactions.map((item: Transaction) => ({
    asset: item.symbol || "N/A",
    type: item.type || "Buy",
    quantity: item.quantity?.toString() || "0",
    price: `$${parseFloat(String(item.price || 0)).toFixed(2)}`,
    total: `$${parseFloat(String(item.total_amount || 0)).toFixed(2)}`,
    date: item.created_at ? new Date(item.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
    pnl: item.realized_pn_l ? `$${Math.abs(item.realized_pn_l).toFixed(2)}` : "$0.00",
    pnlPercent: item.realized_pn_l && item.total_amount ? `${((item.realized_pn_l / item.total_amount) * 100).toFixed(2)}%` : "0%",
    profitable: (item.realized_pn_l || 0) >= 0,
  }));

  // Filter by date if provided
  const filteredHistory = dateFilter 
    ? tradeHistory.filter((trade: TradeItem) => trade.date.includes(dateFilter))
    : tradeHistory;

  const totalPnL = filteredHistory.reduce((acc: number, trade: TradeItem) => {
    const value = parseFloat(trade.pnl.replace(/[^0-9.-]/g, ""));
    return acc + value;
  }, 0);

  const winCount = filteredHistory.filter((t: TradeItem) => t.profitable).length;
  const winRate = filteredHistory.length > 0 ? ((winCount / filteredHistory.length) * 100).toFixed(0) : "0";

  const totalVolume = filteredHistory.reduce((acc: number, trade: TradeItem) => {
    return acc + parseFloat(trade.total.replace(/[^0-9.-]/g, ""));
  }, 0);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Trade History</h1>
            <p className="text-sm text-muted-foreground">Loading history...</p>
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
          <div className="text-2xl font-semibold text-foreground font-mono">{historyResponse?.stats?.total_trades || filteredHistory.length}</div>
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
          <div className="text-2xl font-semibold text-success font-mono">{historyResponse?.stats?.win_rate?.toFixed(0) || winRate}%</div>
        </div>
        <div className="terminal-card p-4">
          <div className="text-xs text-muted-foreground mb-1">Volume</div>
          <div className="text-2xl font-semibold text-foreground font-mono">${(historyResponse?.stats?.total_volume || totalVolume).toFixed(2)}</div>
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
              {filteredHistory.map((trade: TradeItem, index: number) => (
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

