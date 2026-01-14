import { useState } from "react";
import { Star, TrendingUp, TrendingDown, Info, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const timeframes = ["1D", "5D", "1M", "3M", "1Y", "ALL"];

const insiderTransactions = [
  { name: "Jensen Huang", role: "CEO", type: "Sell", shares: "100,000", price: "$180.50", date: "Jan 8, 2026" },
  { name: "Colette Kress", role: "CFO", type: "Buy", shares: "25,000", price: "$175.20", date: "Jan 5, 2026" },
  { name: "Debora Shoquist", role: "EVP", type: "Sell", shares: "50,000", price: "$178.30", date: "Jan 3, 2026" },
];

const relatedStocks = [
  { symbol: "AMD", name: "Advanced Micro Devices", price: "$156.78", change: "+2.34%", positive: true },
  { symbol: "INTC", name: "Intel Corporation", price: "$34.56", change: "-1.23%", positive: false },
  { symbol: "AVGO", name: "Broadcom Inc.", price: "$178.90", change: "+1.56%", positive: true },
];

export default function Trade() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [quantity, setQuantity] = useState("");

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stock Header */}
      <div className="terminal-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-success/10 flex items-center justify-center">
              <span className="font-mono text-lg font-bold text-success">N</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-foreground">NVDA</h1>
                <span className="text-sm text-muted-foreground">• NVIDIA Corporation</span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Star className="w-4 h-4 text-muted-foreground hover:text-warning" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-2xl font-semibold text-foreground">$181.46</span>
                <span className="flex items-center gap-1 text-success font-mono">
                  <TrendingUp className="w-4 h-4" />
                  +$3.92 (+2.21%)
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors",
                  selectedTimeframe === tf
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="terminal-card p-4">
            <div className="h-80 flex items-center justify-center border border-dashed border-border rounded-sm">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm">Candlestick Chart</p>
                <p className="text-xs text-muted-foreground mt-1">TradingView integration coming soon</p>
              </div>
            </div>
          </div>

          {/* Stock Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Open", value: "$177.54" },
              { label: "High", value: "$183.20", highlight: "success" },
              { label: "Low", value: "$176.80", highlight: "destructive" },
              { label: "Prev Close", value: "$177.54" },
              { label: "Market Cap", value: "$4.47T" },
              { label: "P/E Ratio", value: "68.2" },
              { label: "52W High", value: "$195.50" },
              { label: "52W Low", value: "$85.20" },
            ].map((stat) => (
              <div key={stat.label} className="terminal-card p-3">
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div
                  className={cn(
                    "font-mono text-sm font-medium",
                    stat.highlight === "success" && "text-success",
                    stat.highlight === "destructive" && "text-destructive",
                    !stat.highlight && "text-foreground"
                  )}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Insider Transactions */}
          <div className="terminal-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">Insider Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Type</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Shares</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Price</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {insiderTransactions.map((tx, index) => (
                    <tr key={index} className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-2">
                        <div className="text-sm text-foreground">{tx.name}</div>
                        <div className="text-xs text-muted-foreground">{tx.role}</div>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-sm font-mono",
                            tx.type === "Buy"
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-sm text-foreground">{tx.shares}</td>
                      <td className="px-4 py-2 text-right font-mono text-sm text-foreground">{tx.price}</td>
                      <td className="px-4 py-2 text-right text-sm text-muted-foreground">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Panel */}
        <div className="space-y-4">
          <div className="terminal-card p-4">
            <Tabs defaultValue="buy" className="space-y-4">
              <TabsList className="w-full bg-muted">
                <TabsTrigger value="buy" className="flex-1 data-[state=active]:bg-success data-[state=active]:text-success-foreground">
                  Buy
                </TabsTrigger>
                <TabsTrigger value="sell" className="flex-1 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
                  Sell
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Order Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOrderType("market")}
                      className={cn(
                        "flex-1 py-2 text-sm rounded-sm border transition-colors",
                        orderType === "market"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Market
                    </button>
                    <button
                      onClick={() => setOrderType("limit")}
                      className={cn(
                        "flex-1 py-2 text-sm rounded-sm border transition-colors",
                        orderType === "limit"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Limit
                    </button>
                  </div>
                </div>

                {orderType === "limit" && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Limit Price</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="font-mono bg-muted border-border"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Quantity</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="font-mono bg-muted border-border"
                  />
                </div>

                <div className="py-3 border-t border-b border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Market Price</span>
                    <span className="font-mono text-foreground">$181.46</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Cost</span>
                    <span className="font-mono text-foreground">
                      ${quantity ? (parseFloat(quantity) * 181.46).toFixed(2) : "0.00"}
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-success hover:bg-success/90 text-success-foreground">
                  Buy NVDA
                </Button>
              </TabsContent>

              <TabsContent value="sell" className="space-y-4">
                <div className="text-center py-8">
                  <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">You don't own any NVDA shares</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Stocks */}
          <div className="terminal-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">Related Stocks</h3>
            </div>
            <div className="divide-y divide-border/50">
              {relatedStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-mono text-sm font-medium text-foreground">{stock.symbol}</div>
                    <div className="text-xs text-muted-foreground">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-foreground">{stock.price}</div>
                    <div
                      className={cn(
                        "font-mono text-xs",
                        stock.positive ? "text-success" : "text-destructive"
                      )}
                    >
                      {stock.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Hours */}
          <div className="terminal-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Market Hours</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pre-Market</span>
                <span className="text-foreground">4:00 AM - 9:30 AM ET</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Regular</span>
                <span className="text-success">9:30 AM - 4:00 PM ET</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">After-Hours</span>
                <span className="text-foreground">4:00 PM - 8:00 PM ET</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
