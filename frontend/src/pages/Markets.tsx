import { useState } from "react";
import { Search, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useStocks, useCryptos } from "@/hooks/useApi";

export default function Markets() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // TanStack Query hooks for data fetching
  const { data: stocksData, isLoading: stocksLoading } = useStocks();
  const { data: cryptoData, isLoading: cryptoLoading } = useCryptos();

  // Parse stocks data
  const parsedStocks = stocksData?.data ? (() => {
    const stocksDataArr = stocksData.data as any[];
    return stocksDataArr.map((stock: any) => {
      const price = parseFloat(stock.close);
      const open = parseFloat(stock.open);
      const changePercent = open !== 0 ? ((price - open) / open) * 100 : 0;
      
      return {
        symbol: stock.symbol,
        name: stock.name || stock.symbol,
        open: `$${open.toFixed(2)}`,
        high: `$${parseFloat(stock.high).toFixed(2)}`,
        low: `$${parseFloat(stock.low).toFixed(2)}`,
        price: `$${price.toFixed(2)}`,
        volume: stock.volume || "0",
        change: `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
        positive: changePercent > 0,
      };
    });
  })() : [];

  // Parse crypto data
  const parsedCrypto = cryptoData?.crypto_market_data ? (() => {
    const cryptoMap = JSON.parse(cryptoData.crypto_market_data || "{}");
    
    const cryptoMappings: { [key: string]: { symbol: string; name: string } } = {
      bitcoin: { symbol: "BTC", name: "Bitcoin" },
      ethereum: { symbol: "ETH", name: "Ethereum" },
      solana: { symbol: "SOL", name: "Solana" },
      tether: { symbol: "USDT", name: "Tether" },
      binancecoin: { symbol: "BNB", name: "BNB" },
      ripple: { symbol: "XRP", name: "Ripple" },
      tron: { symbol: "TRX", name: "Tron" },
      dogecoin: { symbol: "DOGE", name: "Dogecoin" },
      cardano: { symbol: "ADA", name: "Cardano" },
      polkadot: { symbol: "DOT", name: "Polkadot" },
      uniswap: { symbol: "UNI", name: "Uniswap" },
      litecoin: { symbol: "LTC", name: "Litecoin" },
    };
    
    return Object.entries(cryptoMap).map(([id, data]: [string, any]) => {
      const mapping = cryptoMappings[id] || { symbol: id.toUpperCase().slice(0, 3), name: id.charAt(0).toUpperCase() + id.slice(1) };
      return {
        symbol: mapping.symbol,
        name: mapping.name,
        price: `$${data.usd.toFixed(2)}`,
        marketCap: `$${(data.usd_market_cap / 1e9).toFixed(1)}B`,
        volume: `$${(data.usd_24h_vol / 1e9).toFixed(1)}B`,
        change: `${data.usd_24h_change > 0 ? '+' : ''}${data.usd_24h_change.toFixed(2)}%`,
        positive: data.usd_24h_change > 0,
      };
    });
  })() : [];

  const loading = stocksLoading || cryptoLoading;

  const filteredStocks = parsedStocks.filter((stock: any) => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCrypto = parsedCrypto.filter((crypto: any) => 
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Markets</h1>
            <p className="text-sm text-muted-foreground">Loading market data...</p>
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
                  {filteredStocks.map((stock: any) => (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/trade?symbol=${stock.symbol}&type=stock`)}
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
            {filteredCrypto.map((crypto: any) => (
              <div
                key={crypto.symbol}
                className="terminal-card p-4 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden"
                onClick={() => navigate(`/trade?symbol=${crypto.symbol}&type=crypto`)}
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

