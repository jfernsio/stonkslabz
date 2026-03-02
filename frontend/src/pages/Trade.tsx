import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp, TrendingDown, Info, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import CryptoChart from "@/components/TradingViewWidjet";
import StockChart from "@/components/TradingViewStock"
import { useBuyCrypto, useBuyStock, useSellStock, useSellCrypto, API_BASE } from "@/hooks/useApi";
const timeframes = ["1m", "5m", "15m", "1h", "4h", "1d"];

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

const relatedCryptos = [
  { symbol: "ETH", name: "Ethereum", price: "$2,456.78", change: "+3.45%", positive: true },
  { symbol: "SOL", name: "Solana", price: "$156.23", change: "+5.67%", positive: true },
  { symbol: "XRP", name: "Ripple", price: "$0.58", change: "-1.23%", positive: false },
];

export default function Trade() {
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get("symbol") || "BTC";
  const type = searchParams.get("type") || "crypto";
  const isCrypto = type === "crypto";
  
  const [selectedTimeframe, setSelectedTimeframe] = useState("1m");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const { toast } = useToast();
  
  // live price state
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const pollingRef = useRef<number | null>(null);

  // reset current price when symbol/type changes
  useEffect(() => {
    setCurrentPrice(0);
  }, [symbol, isCrypto]);

  const buyStockMutation = useBuyStock();
  const buyCryptoMutation = useBuyCrypto();
  
  const sellStockMutation = useSellStock();
  const sellCryptoMutation = useSellCrypto();

  // prevent double submissions (simple debounce/throttle)
  const inFlightRef = useRef(false);
  const withDebounce = useCallback((fn: () => Promise<void>, delay = 800) => {
    return async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        await fn();
      } finally {
        setTimeout(() => { inFlightRef.current = false; }, delay);
      }
    };
  }, []);

  // fetch latest price for estimated cost for non-crypto symbols
  useEffect(() => {
    if (isCrypto) return; // crypto uses websocket price
    let mounted = true;
    const fetchPrice = async () => {
      try {
        const res = await fetch(`${API_BASE}/ticker/${symbol.toUpperCase()}`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        // attempt to extract last close price from response
        let price = 0;
        if (Array.isArray(data) && data.length > 0) {
          const last = data[data.length - 1];
          if (Array.isArray(last) && last.length >= 5) price = parseFloat(String(last[4]));
          else if (last && typeof last === 'object') price = parseFloat(String(last.close ?? last.c ?? last.price ?? 0));
        } else if (data && typeof data === 'object') {
          const cand = (data.data && Array.isArray(data.data) && data.data[data.data.length - 1]) ||
                       (data.candles && data.candles[data.candles.length - 1]) ||
                       (data.klines && data.klines[data.klines.length - 1]) ||
                       null;
          if (cand) {
            if (Array.isArray(cand) && cand.length >= 5) price = parseFloat(String(cand[4]));
            else price = parseFloat(String(cand.close ?? cand.c ?? cand.price ?? 0));
          } else if (typeof data.currentPrice === 'number' || typeof data.price === 'number') {
            price = parseFloat(String(data.currentPrice ?? data.price));
          }
        }
        if (mounted && !Number.isNaN(price) && price > 0) setCurrentPrice(price);
      } catch (e) { /* ignore */ }
    };

    // initial fetch and polling every 15s
    fetchPrice();
    pollingRef.current = window.setInterval(fetchPrice, 15000);
    return () => { mounted = false; if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [symbol, isCrypto]);

  // create debounced handlers
  const debouncedBuy = withDebounce(async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast({ title: "Invalid Quantity", description: "Please enter a valid quantity", variant: "destructive" });
      return;
    }
    try {
      if (type !== "crypto") {
        await buyStockMutation.mutateAsync({ symbol, quantity: parseFloat(quantity) });
      } else {
        await buyCryptoMutation.mutateAsync({ symbol, quantity: parseFloat(quantity) });
      }

      toast({ title: "Order Placed", description: `Buy order for ${quantity} ${symbol} successful`, variant: "default" });
      setQuantity("");
    } catch (error) {
      toast({ title: "Order Failed", description: "Something went wrong while placing the order.", variant: "destructive" });
    }
  });

  const debouncedSell = withDebounce(async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast({ title: "Invalid Quantity", description: "Please enter a valid quantity", variant: "destructive" });
      return;
    }
    try {
      if (type !== "crypto") {
        await sellStockMutation.mutateAsync({ symbol, quantity: parseFloat(quantity) });
      } else {
        await sellCryptoMutation.mutateAsync({ symbol, quantity: parseFloat(quantity) });
      }

      toast({ title: "Order Placed", description: `Sell order for ${quantity} ${symbol} successful`, variant: "default" });
      setQuantity("");
    } catch (error) {
      toast({ title: "Order Failed", description: "Something went wrong while placing the order.", variant: "destructive" });
    }
  });



  return (
    <div className="space-y-4 animate-fade-in">
      {/* Asset Header */}
      <div className="terminal-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-sm flex items-center justify-center",
              isCrypto ? "bg-orange-500/10" : "bg-success/10"
            )}>
              <span className={cn(
                "font-mono text-lg font-bold",
                isCrypto ? "text-orange-500" : "text-success"
              )}>
                {symbol.slice(0, 2)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-foreground">{symbol}</h1>
                <span className="text-sm text-muted-foreground">
                  • {isCrypto ? `${symbol}/USDT` : "Stock"}
                </span>
                <FavoriteButton symbol={symbol} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isCrypto ? "Cryptocurrency" : "Equity"} • Live Data
              </p>
            </div>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-sm">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={cn(
                  "px-3 py-1.5 text-xs font-mono font-medium rounded-sm transition-colors",
                  selectedTimeframe === tf
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chart */}
          {isCrypto ? (
            <CryptoChart
              symbol={symbol}
              interval={selectedTimeframe}
              onPriceUpdate={(p) => setCurrentPrice(p)}
            />
          ) : <StockChart symbol={symbol} interval={selectedTimeframe} />
          }

          {/* Insider Transactions for Stocks */}
          {!isCrypto && (
            <div className="terminal-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm text-foreground">Insider Transactions</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Shares</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {insiderTransactions.map((tx, i) => (
                    <tr key={i} className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground">{tx.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{tx.role}</td>
                      <td className={cn(
                        "px-4 py-3 text-sm font-medium",
                        tx.type === "Buy" ? "text-success" : "text-destructive"
                      )}>
                        {tx.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{tx.shares}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{tx.price}</td>
                      <td className="px-4 py-3 text-sm text-right text-muted-foreground">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Panel */}
        <div className="space-y-4">
          <div className="terminal-card overflow-hidden">
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-muted/30 rounded-none border-b border-border">
                <TabsTrigger 
                  value="buy" 
                  className="data-[state=active]:bg-success/10 data-[state=active]:text-success rounded-none"
                >
                  Buy
                </TabsTrigger>
                <TabsTrigger 
                  value="sell"
                  className="data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive rounded-none"
                >
                  Sell
                </TabsTrigger>
              </TabsList>

              <div className="p-4 space-y-4">
                {/* Order Type */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderType("market")}
                    className={cn(
                      "flex-1 py-2 text-xs font-medium rounded-sm transition-colors",
                      orderType === "market"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Market
                  </button>
                  <button
                    onClick={() => setOrderType("limit")}
                    className={cn(
                      "flex-1 py-2 text-xs font-medium rounded-sm transition-colors",
                      orderType === "limit"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Limit
                  </button>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Quantity</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="font-mono bg-muted/30 border-border"
                  />
                </div>

                {/* Limit Price */}
                {orderType === "limit" && (
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Limit Price</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      className="font-mono bg-muted/30 border-border"
                    />
                  </div>
                )}

                {/* Estimated */}
                <div className="p-3 bg-muted/20 rounded-sm">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Estimated Cost</span>
                    <span className="font-mono text-foreground">
                      ${(() => {
                        const qty = quantity ? parseFloat(quantity) : 0;
                        const price = orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : currentPrice || 0;
                        return (qty * price).toFixed(2);
                      })()}
                    </span>
                  </div>
                </div>

                <TabsContent value="buy" className="mt-0">
                  <Button 
                    className="w-full bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => debouncedBuy()}
                  >
                    Buy {symbol}
                  </Button>
                </TabsContent>
                <TabsContent value="sell" className="mt-0">
                  <Button 
                    className="w-full bg-destructive hover:bg-destructive/90"
                    onClick={() => debouncedSell()}
                  >
                    Sell {symbol}
                  </Button>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Related Assets */}
          <div className="terminal-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">
                Related {isCrypto ? "Cryptocurrencies" : "Stocks"}
              </h3>
            </div>
            <div className="divide-y divide-border/50">
              {(isCrypto ? relatedCryptos : relatedStocks).map((asset) => (
                <div 
                  key={asset.symbol} 
                  className="px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/trade?symbol=${asset.symbol}&type=${isCrypto ? 'crypto' : 'stock'}`}
                >
                  <div>
                    <div className="font-medium text-sm text-foreground">{asset.symbol}</div>
                    <div className="text-xs text-muted-foreground">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-foreground">{asset.price}</div>
                    <div className={cn(
                      "text-xs font-mono",
                      asset.positive ? "text-success" : "text-destructive"
                    )}>
                      {asset.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Info */}
          <div className="terminal-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">Market Hours</h3>
            </div>
            <div className="space-y-2 text-xs">
              {isCrypto ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-success font-medium">24/7 Trading</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pre-Market</span>
                    <span className="text-foreground">4:00 AM - 9:30 AM ET</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Regular</span>
                    <span className="text-foreground">9:30 AM - 4:00 PM ET</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">After-Hours</span>
                    <span className="text-foreground">4:00 PM - 8:00 PM ET</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
