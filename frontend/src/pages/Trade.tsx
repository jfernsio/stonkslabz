import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Star, TrendingUp, TrendingDown, Info, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import  LiveCryptoChart  from "@/components/TradingViewChart";
import  CryptoChart from "@/components/TradingViewWidjet"
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
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get("symbol") || "NVDA";
  const type = searchParams.get("type") || "stock";
  const isCrypto = type === "crypto";
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [quantity, setQuantity] = useState("");
  const [cryptoData, setCryptoData] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

useEffect(() => {
  setLoading(true);
   fetchRecentTrades()
  if (type !== "crypto") {
    setLoading(false);
    return;
  }

  // 1. At minimum – uncomment and fix one data source
  // OR 2. remove all cryptoData / recentTrades logic and just show chart
 
  // Temporary minimal fix:
  setCryptoData({ lastPrice: "99999", priceChangePercent: "0.00" /* fake */ });
  setLoading(false);
}, [symbol, type],);
 
  

  
  // const fetchCryptoData = async () => {
  //   try {
  //     const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`);
  //     if (response.ok) {
  //       const data = await response.json();
  //       setCryptoData(data);
  //     }
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch crypto data",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const fetchRecentTrades = async () => {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/trades?symbol=${symbol}USDT&limit=500`);
      if (response.ok) {
        const trades = await response.json();
        // Normalize REST API data
        const normalizedTrades = trades.map(trade => ({
          id: trade.id,
          price: trade.price,
          qty: trade.qty,
          time: trade.time,
          isBuyerMaker: trade.isBuyerMaker,
        }));
        setRecentTrades(normalizedTrades);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch recent trades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // const connectWebSocket = () => {
  //   const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@trade`);

  //   ws.onopen = () => {
  //     console.log("WebSocket connected");
  //   };

  //   ws.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       // Normalize WebSocket data to match REST API format
  //       const normalizedTrade = {
  //         id: data.t,
  //         price: data.p,
  //         qty: data.q,
  //         time: data.T,
  //         isBuyerMaker: data.m,
  //       };
  //       // Add new trade to the beginning of the array, keep only latest 500
  //       setRecentTrades(prev => [normalizedTrade, ...prev.slice(0, 499)]);

  //       // Update crypto data with latest price
  //       setCryptoData(prev => prev ? {
  //         ...prev,
  //         lastPrice: data.p,
  //         priceChange: parseFloat(data.p) - parseFloat(prev.openPrice || prev.lastPrice),
  //         priceChangePercent: ((parseFloat(data.p) - parseFloat(prev.openPrice || prev.lastPrice)) / parseFloat(prev.openPrice || prev.lastPrice) * 100).toFixed(2)
  //       } : null);
  //     } catch (error) {
  //       console.error("Error parsing WebSocket data:", error);
  //     }
  //   };

  //   ws.onerror = (error) => {
  //     console.error("WebSocket error:", error);
  //     toast({
  //       title: "Connection Error",
  //       description: "Failed to connect to live trading data",
  //       variant: "destructive",
  //     });
  //   };

  //   ws.onclose = () => {
  //     console.log("WebSocket disconnected");
  //   };

  //   // Return cleanup function
  //   return () => {
  //     console.log("Cleaning up WebSocket connection");
  //     ws.close();
  //   };
  // };

  const handleBuy = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/get-crypto-trade/${symbol}/${quantity}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to trade",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Successfully bought ${quantity} ${symbol}`,
        });
        // Refresh portfolio data if needed
      } else {
        toast({
          title: "Trade Failed",
          description: data.message || "Failed to execute trade",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSell = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/sell-crypto-trade/${symbol}/${quantity}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to trade",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Successfully sold ${quantity} ${symbol}`,
        });
        // Refresh portfolio data if needed
      } else {
        toast({
          title: "Trade Failed",
          description: data.message || "Failed to execute trade",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Trade</h1>
            <p className="text-sm text-muted-foreground">Loading {symbol} data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Asset Header */}
      <div className="terminal-card p-4">
        <div className="flex items-center justify-between">
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
                  • {isCrypto ? `${symbol}/USDT` : "NVIDIA Corporation"}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Star className="w-4 h-4 text-muted-foreground hover:text-warning" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {isCrypto && cryptoData ? (
                  <>
                    <span className="font-mono text-2xl font-semibold text-foreground">
                      ${parseFloat(cryptoData.lastPrice).toFixed(2)}
                    </span>
                    <span className={cn(
                      "flex items-center gap-1 font-mono",
                      parseFloat(cryptoData.priceChangePercent) >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {parseFloat(cryptoData.priceChangePercent) >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {parseFloat(cryptoData.priceChangePercent) >= 0 ? '+' : ''}
                      {parseFloat(cryptoData.priceChangePercent).toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-2xl font-semibold text-foreground">$181.46</span>
                    <span className="flex items-center gap-1 text-success font-mono">
                      <TrendingUp className="w-4 h-4" />
                      +$3.92 (+2.21%)
                    </span>
                  </>
                )}
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
{      
      <CryptoChart  symbol={symbol}
       /> }
    
          </div>

          {/* Recent Trades for Crypto */}
          {isCrypto && (
            <div className="terminal-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm text-foreground">Recent Trades</h3>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {recentTrades.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-sm bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <p className="text-sm text-muted-foreground">Loading recent trades...</p>
                    </div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Time</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Price</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Quantity</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {recentTrades.slice(0, 500).map((trade, index) => (
                        <tr key={trade.id || index} className="hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-2 text-xs text-muted-foreground">
                            {trade.time ? new Date(trade.time).toLocaleTimeString() : '--:--:--'}
                          </td>
                          <td className={cn(
                            "px-4 py-2 text-right font-mono text-sm",
                            trade.isBuyerMaker ? "text-destructive" : "text-success"
                          )}>
                            ${trade.price && !isNaN(parseFloat(trade.price)) ? parseFloat(trade.price).toFixed(2) : '0.00'}
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-sm text-foreground">
                            {trade.qty && !isNaN(parseFloat(trade.qty)) ? parseFloat(trade.qty).toFixed(6) : '0.000000'}
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-sm text-foreground">
                            {trade.price && trade.qty && !isNaN(parseFloat(trade.price)) && !isNaN(parseFloat(trade.qty))
                              ? (parseFloat(trade.price) * parseFloat(trade.qty)).toFixed(2)
                              : '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Asset Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {isCrypto && cryptoData ? (
              [
                { label: "24h High", value: `$${parseFloat(cryptoData.highPrice).toFixed(2)}`, highlight: "success" },
                { label: "24h Low", value: `$${parseFloat(cryptoData.lowPrice).toFixed(2)}`, highlight: "destructive" },
                { label: "24h Volume", value: `${(parseFloat(cryptoData.volume) / 1000000).toFixed(1)}M` },
                { label: "24h Change", value: `${parseFloat(cryptoData.priceChangePercent).toFixed(2)}%`, highlight: parseFloat(cryptoData.priceChangePercent) >= 0 ? "success" : "destructive" },
                { label: "Market Cap", value: `$${(parseFloat(cryptoData.lastPrice) * parseFloat(cryptoData.count) / 1000000000).toFixed(1)}B` },
                { label: "Price Change", value: `$${parseFloat(cryptoData.priceChange).toFixed(2)}` },
                { label: "Bid Price", value: `$${parseFloat(cryptoData.bidPrice).toFixed(2)}` },
                { label: "Ask Price", value: `$${parseFloat(cryptoData.askPrice).toFixed(2)}` },
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
              ))
            ) : (
              [
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
              ))
            )}
          </div>

          {/* Insider Transactions - Only for stocks */}
          {!isCrypto && (
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
          )}
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
                    <span className="font-mono text-foreground">
                      {isCrypto && cryptoData ? `$${parseFloat(cryptoData.lastPrice).toFixed(2)}` : "$181.46"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Cost</span>
                    <span className="font-mono text-foreground">
                      {isCrypto && cryptoData ? (
                        quantity ? `$${(parseFloat(quantity) * parseFloat(cryptoData.lastPrice)).toFixed(2)}` : "$0.00"
                      ) : (
                        quantity ? `$${(parseFloat(quantity) * 181.46).toFixed(2)}` : "$0.00"
                      )}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  onClick={handleBuy}
                >
                  Buy {symbol}
                </Button>
              </TabsContent>

              <TabsContent value="sell" className="space-y-4">
                {quantity ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Quantity</span>
                        <span className="text-sm font-medium">{quantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Estimated Value</span>
                        <span className="text-sm font-medium">
                          {isCrypto && cryptoData ? (
                            `$${(parseFloat(quantity) * parseFloat(cryptoData.lastPrice)).toFixed(2)}`
                          ) : (
                            `$${(parseFloat(quantity) * 181.46).toFixed(2)}`
                          )}
                        </span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      onClick={handleSell}
                    >
                      Sell {symbol}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Enter a quantity to sell {symbol} {isCrypto ? "tokens" : "shares"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Assets */}
          <div className="terminal-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">
                Related {isCrypto ? "Cryptos" : "Stocks"}
              </h3>
            </div>
            <div className="divide-y divide-border/50">
              {isCrypto ? (
                // Related cryptos
                [
                  { symbol: "ETH", name: "Ethereum", price: "$3,456.78", change: "+2.15%", positive: true },
                  { symbol: "BNB", name: "BNB", price: "$612.30", change: "+0.87%", positive: true },
                  { symbol: "ADA", name: "Cardano", price: "$0.4521", change: "+1.23%", positive: true },
                ].map((crypto) => (
                  <div
                    key={crypto.symbol}
                    className="px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/trade?symbol=${crypto.symbol}&type=crypto`}
                  >
                    <div>
                      <div className="font-mono text-sm font-medium text-foreground">{crypto.symbol}</div>
                      <div className="text-xs text-muted-foreground">{crypto.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-foreground">{crypto.price}</div>
                      <div
                        className={cn(
                          "font-mono text-xs",
                          crypto.positive ? "text-success" : "text-destructive"
                        )}
                      >
                        {crypto.change}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Related stocks
                relatedStocks.map((stock) => (
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
                ))
              )}
            </div>
          </div>

          {/* Market Hours / Trading Status */}
          <div className="terminal-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {isCrypto ? "Trading Status" : "Market Hours"}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {isCrypto ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-success">24/7 Trading</span>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
