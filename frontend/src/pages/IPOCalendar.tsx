import { Calendar, ArrowUpRight, Clock, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ipoData = [
  { date: "Jan 15, 2026", company: "TechVentures AI", symbol: "TVAI", exchange: "NASDAQ", priceRange: "$18 - $22", shares: "15M", status: "Expected" },
  { date: "Jan 18, 2026", company: "GreenEnergy Corp", symbol: "GECO", exchange: "NYSE", priceRange: "$24 - $28", shares: "20M", status: "Filed" },
  { date: "Jan 22, 2026", company: "CloudScale Inc", symbol: "CSCA", exchange: "NASDAQ", priceRange: "$32 - $36", shares: "12M", status: "Expected" },
  { date: "Jan 25, 2026", company: "BioMed Solutions", symbol: "BMED", exchange: "NYSE", priceRange: "$15 - $18", shares: "25M", status: "Filed" },
  { date: "Feb 1, 2026", company: "QuantumTech Labs", symbol: "QTCH", exchange: "NASDAQ", priceRange: "$45 - $52", shares: "10M", status: "Expected" },
  { date: "Feb 5, 2026", company: "FinFlow Digital", symbol: "FFIN", exchange: "NYSE", priceRange: "$22 - $26", shares: "18M", status: "Filed" },
];

export default function IPOCalendar() {
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
              <div className="text-2xl font-semibold text-foreground font-mono">12</div>
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
              <div className="text-2xl font-semibold text-foreground font-mono">$2.4B</div>
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
              <div className="text-2xl font-semibold text-foreground font-mono">6</div>
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
              {ipoData.map((ipo, index) => (
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
                  <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{ipo.priceRange}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{ipo.shares}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-sm font-medium",
                        ipo.status === "Expected"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      )}
                    >
                      {ipo.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
