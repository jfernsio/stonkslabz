import { useState } from "react";
import { Search, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const stocksData = [
  { symbol: "AAPL", name: "Apple Inc.", open: "$230.50", high: "$235.20", low: "$229.80", price: "$233.16", volume: "45.2M", change: "+1.54%", positive: true },
  { symbol: "MSFT", name: "Microsoft Corp", open: "$518.30", high: "$522.10", low: "$516.90", price: "$520.42", volume: "23.1M", change: "-0.24%", positive: false },
  { symbol: "GOOGL", name: "Alphabet Inc", open: "$198.20", high: "$203.50", low: "$197.40", price: "$201.56", volume: "18.7M", change: "+2.65%", positive: true },
  { symbol: "AMZN", name: "Amazon.com Inc", open: "$246.80", high: "$248.30", low: "$243.20", price: "$244.16", volume: "32.5M", change: "-1.53%", positive: false },
  { symbol: "TSLA", name: "Tesla Inc.", open: "$335.40", high: "$342.80", low: "$332.10", price: "$339.62", volume: "89.4M", change: "+1.72%", positive: true },
  { symbol: "META", name: "Meta Platforms Inc", open: "$770.20", high: "$775.40", low: "$758.30", price: "$762.96", volume: "15.3M", change: "-2.54%", positive: false },
  { symbol: "NVDA", name: "NVIDIA Corp", open: "$176.30", high: "$183.20", low: "$175.80", price: "$181.46", volume: "156.2M", change: "+2.21%", positive: true },
  { symbol: "NFLX", name: "Netflix Inc", open: "$1,225.60", high: "$1,238.50", low: "$1,210.20", price: "$1,214.45", volume: "8.9M", change: "-2.62%", positive: false },
];

const cryptoData = [
  { symbol: "BTC", name: "Bitcoin", price: "$67,234.50", marketCap: "$1.32T", volume: "$28.5B", change: "+3.21%", positive: true },
  { symbol: "ETH", name: "Ethereum", price: "$3,456.78", marketCap: "$415.2B", volume: "$12.3B", change: "+2.15%", positive: true },
  { symbol: "SOL", name: "Solana", price: "$178.45", marketCap: "$82.1B", volume: "$4.2B", change: "-1.32%", positive: false },
  { symbol: "BNB", name: "BNB", price: "$612.30", marketCap: "$91.5B", volume: "$1.8B", change: "+0.87%", positive: true },
  { symbol: "XRP", name: "Ripple", price: "$0.5234", marketCap: "$28.9B", volume: "$1.2B", change: "-0.45%", positive: false },
  { symbol: "ADA", name: "Cardano", price: "$0.4521", marketCap: "$15.8B", volume: "$456M", change: "+1.23%", positive: true },
];

export default function Markets() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Markets</h1>
          <p className="text-sm text-muted-foreground">Real-time market data and insights</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by symbol or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stocks" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="stocks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Stocks
          </TabsTrigger>
          <TabsTrigger value="crypto" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Crypto
          </TabsTrigger>
        </TabsList>

        {/* Stocks Table */}
        <TabsContent value="stocks" className="space-y-4">
          <div className="terminal-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Open</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">High</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Low</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Volume</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {stocksData.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-accent/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-mono text-sm font-medium text-foreground">{stock.symbol}</div>
                            <div className="text-xs text-muted-foreground">{stock.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{stock.open}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-success">{stock.high}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-destructive">{stock.low}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-medium text-foreground">{stock.price}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{stock.volume}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-mono text-sm",
                            stock.positive ? "text-success" : "text-destructive"
                          )}
                        >
                          {stock.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {stock.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Crypto Cards */}
        <TabsContent value="crypto" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cryptoData.map((crypto) => (
              <div
                key={crypto.symbol}
                className="terminal-card p-4 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden"
              >
                {/* Glow */}
                <div
                  className={cn(
                    "absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20",
                    crypto.positive ? "bg-success" : "bg-destructive"
                  )}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-sm flex items-center justify-center font-mono text-xs font-bold",
                          crypto.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {crypto.symbol}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{crypto.name}</div>
                        <div className="text-xs text-muted-foreground">{crypto.symbol}</div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-mono text-sm px-2 py-1 rounded-sm",
                        crypto.positive
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {crypto.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {crypto.change}
                    </span>
                  </div>

                  <div className="font-mono text-2xl font-semibold text-foreground mb-3">
                    {crypto.price}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Market Cap</div>
                      <div className="font-mono text-foreground">{crypto.marketCap}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">24h Volume</div>
                      <div className="font-mono text-foreground">{crypto.volume}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
