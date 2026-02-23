import { Calendar, ArrowUpRight, Clock, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIPO } from "@/hooks/useApi";

interface IPOItem {
  date: string;
  company: string;
  symbol: string;
  exchange: string;
  priceRange: string;
  shares: string;
  status: string;
}

// Backend IPO response format:
// { data: [{ date, exchange, name, price, status, symbol, totalSharesValue }] }
interface IPOData {
  date: string;
  exchange: string;
  name: string;
  price: string;
  status: string;
  symbol: string;
  totalSharesValue: number;
}

export default function IPOCalendar() {
  const { data: ipoData, isLoading } = useIPO();

  // Parse IPO data from backend - directly use the data array
  const parsedIPO: IPOItem[] = ipoData?.data ? (() => {
    try {
      const data = ipoData.data as IPOData[];
      if (Array.isArray(data)) {
        return data.map((item: IPOData) => ({
          date: item.date || "",
          company: item.name || "Unknown Company",
          symbol: item.symbol || "N/A",
          exchange: item.exchange || "NASDAQ",
          priceRange: item.price || "$0 - $0",
          shares: item.totalSharesValue ? `${(item.totalSharesValue / 1000000).toFixed(0)}M` : "0",
          status: item.status || "Expected",
        }));
      }
      return [];
    } catch {
      return [];
    }
  })() : [];

  // Calculate stats
  const thisMonth = parsedIPO.length;
  const expectedRaised = parsedIPO.reduce((acc: number, ipo: IPOItem) => {
    const shares = parseFloat(ipo.shares.replace(/[^0-9.]/g, "0")) * 1000000;
    return acc + shares;
  }, 0);
  const nasdaqListings = parsedIPO.filter((ipo: IPOItem) => ipo.exchange === "NASDAQ").length;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">IPO Calendar</h1>
            <p className="text-sm text-muted-foreground">Loading IPO data...</p>
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
          <h1 className="text-2xl font-semibold text-foreground">IPO Calendar</h1>
          <p className="text-sm text-muted-foreground">Upcoming initial public offerings</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Q1 2026</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="terminal-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground font-mono">{thisMonth}</div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </div>
          </div>
        </div>
        <div className="terminal-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-success/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground font-mono">${(expectedRaised / 1e9).toFixed(1)}B</div>
              <div className="text-xs text-muted-foreground">Expected Raised</div>
            </div>
          </div>
        </div>
        <div className="terminal-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-secondary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground font-mono">{nasdaqListings}</div>
              <div className="text-xs text-muted-foreground">NASDAQ Listings</div>
            </div>
          </div>
        </div>
      </div>

      {/* IPO Table */}
      <div className="terminal-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">Upcoming IPOs</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-muted-foreground">Expected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-muted-foreground">Filed</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Exchange</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price Range</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shares</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {parsedIPO.length > 0 ? parsedIPO.map((ipo: IPOItem, index: number) => (
                <tr
                  key={index}
                  className="hover:bg-accent/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{ipo.date}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-foreground">{ipo.company}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-primary">{ipo.symbol}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{ipo.exchange}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-foreground">${ipo.priceRange}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{ipo.shares}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-sm font-medium",
                        ipo.status === "upcoming" || ipo.status === "Expected"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      )}
                    >
                      {ipo.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No upcoming IPOs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

