import { Search, Bell, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const marketTickers = [
  { symbol: "S&P 500", value: "5,603.24", change: "+1.4%", positive: true },
  { symbol: "NASDAQ", value: "17,890.45", change: "+1.8%", positive: true },
  { symbol: "BTC", value: "67,234.50", change: "-0.5%", positive: false },
  { symbol: "ETH", value: "3,456.78", change: "+2.1%", positive: true },
];

export function TopBar() {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between gap-4 px-4">
      {/* Ticker Tape */}
      <div className="flex items-center gap-6 overflow-hidden">
        {marketTickers.map((ticker) => (
          <div key={ticker.symbol} className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium">{ticker.symbol}</span>
            <span className="font-mono text-foreground">{ticker.value}</span>
            <span
              className={`font-mono text-xs ${
                ticker.positive ? "text-success text-glow-green" : "text-destructive text-glow-red"
              }`}
            >
              {ticker.change}
            </span>
          </div>
        ))}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks, crypto..."
            className="w-64 pl-9 bg-muted border-border focus:border-primary h-9"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
            ⌘K
          </kbd>
        </div>

        {/* Balance */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-sm border border-border">
          <span className="text-xs text-muted-foreground">Balance</span>
          <span className="font-mono text-sm text-primary font-semibold">$125,430.50</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-sm bg-secondary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-secondary" />
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}