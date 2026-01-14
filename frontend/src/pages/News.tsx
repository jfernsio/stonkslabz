import { useState } from "react";
import { Clock, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const newsData = [
  {
    category: "stocks",
    title: "NVIDIA Surges as AI Demand Exceeds Expectations",
    source: "Wall Street Journal",
    time: "2 hours ago",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop",
    ticker: "NVDA",
    tickerChange: "+2.21%",
    positive: true,
  },
  {
    category: "crypto",
    title: "Bitcoin ETF Sees Record Inflows as Institutional Interest Grows",
    source: "Bloomberg",
    time: "3 hours ago",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=200&fit=crop",
    ticker: "BTC",
    tickerChange: "+3.21%",
    positive: true,
  },
  {
    category: "market",
    title: "Federal Reserve Signals Potential Rate Cuts in 2026",
    source: "Reuters",
    time: "5 hours ago",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=200&fit=crop",
    ticker: "SPY",
    tickerChange: "+1.4%",
    positive: true,
  },
  {
    category: "stocks",
    title: "Apple Announces Revolutionary AR Glasses at CES",
    source: "TechCrunch",
    time: "6 hours ago",
    image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400&h=200&fit=crop",
    ticker: "AAPL",
    tickerChange: "+1.54%",
    positive: true,
  },
  {
    category: "crypto",
    title: "Ethereum 3.0 Upgrade Timeline Announced by Vitalik",
    source: "CoinDesk",
    time: "8 hours ago",
    image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=200&fit=crop",
    ticker: "ETH",
    tickerChange: "+2.15%",
    positive: true,
  },
  {
    category: "market",
    title: "Tech Sector Leads Market Rally Amid Strong Earnings",
    source: "CNBC",
    time: "10 hours ago",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
    ticker: "QQQ",
    tickerChange: "+1.8%",
    positive: true,
  },
];

export default function News() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredNews = activeTab === "all" 
    ? newsData 
    : newsData.filter(news => news.category === activeTab);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">News</h1>
          <p className="text-sm text-muted-foreground">Latest financial news and updates</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            All News
          </TabsTrigger>
          <TabsTrigger value="market" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Market
          </TabsTrigger>
          <TabsTrigger value="stocks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Stocks
          </TabsTrigger>
          <TabsTrigger value="crypto" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Crypto
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNews.map((news, index) => (
              <article
                key={index}
                className="terminal-card overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <div className="absolute bottom-2 left-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-sm font-mono",
                        news.positive
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                      )}
                    >
                      {news.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {news.ticker} {news.tickerChange}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-foreground text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {news.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{news.source}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {news.time}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Featured News */}
      <div className="terminal-card p-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Trending</h2>
        <div className="space-y-3">
          {newsData.slice(0, 4).map((news, index) => (
            <div
              key={index}
              className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors cursor-pointer rounded-sm px-2 -mx-2"
            >
              <span className="text-lg font-mono text-muted-foreground">0{index + 1}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm text-foreground truncate">{news.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{news.source}</span>
                  <span>•</span>
                  <span>{news.time}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
