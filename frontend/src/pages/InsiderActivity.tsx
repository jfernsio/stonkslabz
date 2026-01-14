import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const sentimentData = [
  { month: "Jul", buy: 45, sell: 23 },
  { month: "Aug", buy: 38, sell: 42 },
  { month: "Sep", buy: 52, sell: 18 },
  { month: "Oct", buy: 31, sell: 35 },
  { month: "Nov", buy: 48, sell: 22 },
  { month: "Dec", buy: 55, sell: 15 },
  { month: "Jan", buy: 42, sell: 28 },
];

const transactionsData = [
  { name: "Jensen Huang", company: "NVDA", role: "CEO", type: "Sell", shares: "100,000", shareChange: "-0.5%", price: "$180.50", date: "Jan 8, 2026" },
  { name: "Tim Cook", company: "AAPL", role: "CEO", type: "Sell", shares: "50,000", shareChange: "-0.2%", price: "$232.10", date: "Jan 7, 2026" },
  { name: "Satya Nadella", company: "MSFT", role: "CEO", type: "Buy", shares: "25,000", shareChange: "+0.1%", price: "$518.30", date: "Jan 6, 2026" },
  { name: "Mark Zuckerberg", company: "META", role: "CEO", type: "Sell", shares: "200,000", shareChange: "-0.8%", price: "$765.20", date: "Jan 5, 2026" },
  { name: "Sundar Pichai", company: "GOOGL", role: "CEO", type: "Buy", shares: "15,000", shareChange: "+0.05%", price: "$199.80", date: "Jan 4, 2026" },
  { name: "Andy Jassy", company: "AMZN", role: "CEO", type: "Sell", shares: "30,000", shareChange: "-0.3%", price: "$245.60", date: "Jan 3, 2026" },
];

export default function InsiderActivity() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Insider Activity</h1>
          <p className="text-sm text-muted-foreground">Track insider trading patterns</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by stock symbol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Sentiment
          </TabsTrigger>
        </TabsList>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="terminal-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground font-mono">156</div>
                  <div className="text-xs text-muted-foreground">Buy Transactions</div>
                </div>
              </div>
            </div>
            <div className="terminal-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground font-mono">89</div>
                  <div className="text-xs text-muted-foreground">Sell Transactions</div>
                </div>
              </div>
            </div>
            <div className="terminal-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-foreground font-mono">1.64x</div>
                  <div className="text-xs text-muted-foreground">Buy/Sell Ratio</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="terminal-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">Recent Insider Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Insider</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shares</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Share Change</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {transactionsData.map((tx, index) => (
                    <tr key={index} className="hover:bg-accent/30 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-foreground">{tx.name}</div>
                        <div className="text-xs text-muted-foreground">{tx.role}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-primary">{tx.company}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-sm font-mono",
                            tx.type === "Buy"
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{tx.shares}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "font-mono text-sm",
                            tx.shareChange.startsWith("+") ? "text-success" : "text-destructive"
                          )}
                        >
                          {tx.shareChange}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{tx.price}</td>
                      <td className="px-4 py-3 text-right text-sm text-muted-foreground">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Sentiment */}
        <TabsContent value="sentiment" className="space-y-4">
          <div className="terminal-card p-4">
            <h3 className="font-semibold text-sm text-foreground mb-4">Insider Sentiment by Month</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData} barGap={4}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(222, 30%, 18%)",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="buy" fill="hsl(142, 76%, 46%)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="sell" fill="hsl(0, 84%, 60%)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-success" />
                <span className="text-xs text-muted-foreground">Buy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-destructive" />
                <span className="text-xs text-muted-foreground">Sell</span>
              </div>
            </div>
          </div>

          <div className="terminal-card p-4">
            <h3 className="font-semibold text-sm text-foreground mb-3">Market-Wide Insider Sentiment</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-4 bg-muted rounded-sm overflow-hidden">
                <div className="h-full bg-success" style={{ width: "64%" }} />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success font-mono">64%</span>
                <span className="text-muted-foreground">Bullish</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Based on 245 insider transactions in the last 30 days
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
