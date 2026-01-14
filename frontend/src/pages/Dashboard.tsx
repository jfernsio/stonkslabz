import { Wallet, TrendingUp, PieChart, Activity } from "lucide-react";
import { PortfolioCard } from "@/components/dashboard/PortfolioCard";
import { MarketTicker } from "@/components/dashboard/MarketTicker";
import { GainersLosersTable } from "@/components/dashboard/GainersLosersTable";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
import { WatchlistPreview } from "@/components/dashboard/WatchlistPreview";

const marketTickers = [
  { symbol: "S&P 500", name: "Index", price: "$5,603.24", change: "+78.32", changePercent: "+1.4%", positive: true },
  { symbol: "NASDAQ", name: "Index", price: "$17,890.45", change: "+312.50", changePercent: "+1.8%", positive: true },
  { symbol: "BTC", name: "Bitcoin", price: "$67,234.50", change: "-342.10", changePercent: "-0.5%", positive: false },
  { symbol: "ETH", name: "Ethereum", price: "$3,456.78", change: "+72.45", changePercent: "+2.1%", positive: true },
];

const topGainers = [
  { symbol: "NVDA", name: "NVIDIA Corporation", price: "$181.46", change: "+8.21%", positive: true },
  { symbol: "AMD", name: "Advanced Micro Devices", price: "$156.78", change: "+5.43%", positive: true },
  { symbol: "SMCI", name: "Super Micro Computer", price: "$890.12", change: "+4.87%", positive: true },
  { symbol: "META", name: "Meta Platforms", price: "$567.89", change: "+3.21%", positive: true },
];

const topLosers = [
  { symbol: "INTC", name: "Intel Corporation", price: "$34.56", change: "-4.32%", positive: false },
  { symbol: "BA", name: "Boeing Company", price: "$178.90", change: "-3.21%", positive: false },
  { symbol: "DIS", name: "Walt Disney Company", price: "$98.76", change: "-2.87%", positive: false },
  { symbol: "PYPL", name: "PayPal Holdings", price: "$67.54", change: "-2.15%", positive: false },
];

export default function Dashboard() {
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
          value="$125,430.50"
          change="+$2,340.50"
          changePercent="+1.9%"
          positive={true}
          variant="primary"
          icon={<Wallet className="w-5 h-5 text-primary" />}
        />
        <PortfolioCard
          title="Today's P&L"
          value="+$1,234.56"
          change="+1.0%"
          positive={true}
          variant="success"
          icon={<TrendingUp className="w-5 h-5 text-success" />}
        />
        <PortfolioCard
          title="Total Return"
          value="+25.43%"
          change="+$25,430.50"
          positive={true}
          variant="success"
          icon={<PieChart className="w-5 h-5 text-secondary" />}
        />
        <PortfolioCard
          title="Open Positions"
          value="12"
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
          <GainersLosersTable title="Top Gainers" stocks={topGainers} type="gainers" />
          <GainersLosersTable title="Top Losers" stocks={topLosers} type="losers" />
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
