import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, PieChart, Activity } from "lucide-react";
import { PortfolioCard } from "@/components/dashboard/PortfolioCard";
import { MarketTicker } from "@/components/dashboard/MarketTicker";
import { GainersLosersTable } from "@/components/dashboard/GainersLosersTable";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
import { WatchlistPreview } from "@/components/dashboard/WatchlistPreview";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio, useGainers, useLosers } from "@/hooks/useApi";

export default function Dashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // TanStack Query hooks for data fetching
  const { 
    data: portfolioData, 
    isLoading: portfolioLoading, 
    error: portfolioError 
  } = usePortfolio();
  
  const { 
    data: gainersData, 
    isLoading: gainersLoading 
  } = useGainers();
  
  const { 
    data: losersData, 
    isLoading: losersLoading 
  } = useLosers();

  // Handle portfolio error
  if (portfolioError) {
    toast({
      title: "Error",
      description: "Failed to load portfolio data",
      variant: "destructive",
    });
    navigate("/login");
    return null;
  }

  const loading = portfolioLoading || gainersLoading || losersLoading;
  
  // Parse gainers data
  interface StockItem {
    symbol: string;
    name?: string;
    price: string;
    changesPercentage?: number;
  }

  const gainers: { symbol: string; name: string; price: string; change: string; positive: boolean }[] = gainersData?.data ? (() => {
    try {
      const parsed = JSON.parse(gainersData.data || "[]") as StockItem[];
      return parsed.slice(0, 10).map((item: StockItem) => ({
        symbol: item.symbol,
        name: item.name || item.symbol,
        price: `$${parseFloat(item.price).toFixed(2)}`,
        change: `${(item.changesPercentage || 0) > 0 ? '+' : ''}${(item.changesPercentage || 0).toFixed(2)}%`,
        positive: (item.changesPercentage || 0) > 0,
      }));
    } catch {
      return [];
    }
  })() : [];

  // Parse losers data
  const losers: { symbol: string; name: string; price: string; change: string; positive: boolean }[] = losersData?.data ? (() => {
    try {
      const parsed = JSON.parse(losersData.data || "[]") as StockItem[];
      return parsed.slice(0, 10).map((item: StockItem) => ({
        symbol: item.symbol,
        name: item.name || item.symbol,
        price: `$${parseFloat(item.price).toFixed(2)}`,
        change: `${(item.changesPercentage || 0) > 0 ? '+' : ''}${(item.changesPercentage || 0).toFixed(2)}%`,
        positive: (item.changesPercentage || 0) > 0,
      }));
    } catch {
      return [];
    }
  })() : [];

  // Portfolio data from backend
  const portfolio = portfolioData?.data;

  // Market tickers (static for now - could be connected to API if available)
  const marketTickers = [
    { symbol: "S&P 500", name: "Index", price: "$5,603.24", change: "+78.32", changePercent: "+1.4%", positive: true },
    { symbol: "NASDAQ", name: "Index", price: "$17,890.45", change: "+312.50", changePercent: "+1.8%", positive: true },
    { symbol: "BTC", name: "Bitcoin", price: "$67,234.50", change: "-342.10", changePercent: "-0.5%", positive: false },
    { symbol: "ETH", name: "Ethereum", price: "$3,456.78", change: "+72.45", changePercent: "+2.1%", positive: true },
  ];

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Loading...</p>
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
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here's your portfolio overview.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="w-4 h-4 text-success animate-pulse" />
          <span>Live data</span>
        </div>
      </div>

      {/* Portfolio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PortfolioCard
          title="Total Balance"
          value={`$${portfolio?.total_balance || "0.00"}`}
          change={`$${portfolio?.today_pnl || "0.00"}`}
          changePercent={`${portfolio?.percentage_change || "0.00"}%`}
          positive={(parseFloat(portfolio?.percentage_change) || 0) >= 0}
          variant="primary"
          icon={<Wallet className="w-5 h-5 text-primary" />}
        />
        <PortfolioCard
          title="Today's P&L"
          value={`$${portfolio?.today_pnl || "0.00"}`}
          change={`${portfolio?.percentage_change || "0.00"}%`}
          positive={(parseFloat(portfolio?.today_pnl) || 0) >= 0}
          variant="success"
          icon={<TrendingUp className="w-5 h-5 text-success" />}
        />
        <PortfolioCard
          title="Total Return"
          value={`${portfolio?.total_return || "0.00"}%`}
          change={`$${portfolio?.total_return || "0.00"}`}
          positive={(parseFloat(portfolio?.total_return) || 0) >= 0}
          variant="success"
          icon={<PieChart className="w-5 h-5 text-secondary" />}
        />
        <PortfolioCard
          title="Cash Balance"
          value={`$${portfolio?.cash_balance || "0.00"}`}
          positive={true}
          variant="default"
          icon={<Activity className="w-5 h-5 text-muted-foreground" />}
        />
      </div>

      {/* Market Tickers */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Market Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {marketTickers.map((ticker) => (
            <MarketTicker key={ticker.symbol} {...ticker} />
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Gainers/Losers */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <GainersLosersTable title="Top Gainers" stocks={gainers} type="gainers" />
          <GainersLosersTable title="Top Losers" stocks={losers} type="losers" />
        </div>

        {/* Right Column - Allocation & Watchlist */}
        <div className="space-y-4">
          <AllocationChart />
          <WatchlistPreview />
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIInsightCard />
        <div className="terminal-card p-4">
          <h3 className="font-semibold text-sm text-foreground mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: "Bought", symbol: "AAPL", amount: "10 shares", price: "$2,331.60", time: "2 hours ago" },
              { action: "Sold", symbol: "TSLA", amount: "5 shares", price: "$1,698.10", time: "5 hours ago" },
              { action: "Bought", symbol: "BTC", amount: "0.05 BTC", price: "$3,361.72", time: "1 day ago" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-mono ${
                      activity.action === "Bought"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {activity.action === "Bought" ? "B" : "S"}
                  </div>
                  <div>
                    <div className="text-sm text-foreground">
                      {activity.action} <span className="font-mono text-primary">{activity.symbol}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.amount}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-foreground">{activity.price}</div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

