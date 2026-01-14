import { User, Bell, Shield, Palette, Database, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const settingsSections = [
  { icon: User, label: "Account", active: true },
  { icon: Bell, label: "Notifications", active: false },
  { icon: Shield, label: "Security", active: false },
  { icon: Palette, label: "Appearance", active: false },
  { icon: Database, label: "Data", active: false },
  { icon: HelpCircle, label: "Help", active: false },
];

export default function Settings() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="terminal-card p-2">
          <nav className="space-y-1">
            {settingsSections.map((section) => (
              <button
                key={section.label}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors",
                  section.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Profile */}
          <div className="terminal-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Profile</h2>
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 rounded-sm bg-secondary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-secondary" />
              </div>
              <div className="flex-1">
                <Button variant="outline" size="sm">Upload Photo</Button>
                <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Display Name</label>
                <Input defaultValue="John Trader" className="bg-muted border-border" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                <Input defaultValue="john@stonkslab.com" className="bg-muted border-border" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Username</label>
                <Input defaultValue="@johntrader" className="bg-muted border-border" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Timezone</label>
                <Input defaultValue="America/New_York (EST)" className="bg-muted border-border" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button className="bg-primary text-primary-foreground">Save Changes</Button>
            </div>
          </div>

          {/* Trading Preferences */}
          <div className="terminal-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Trading Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-foreground">Default Order Type</div>
                  <div className="text-xs text-muted-foreground">Choose between Market or Limit orders</div>
                </div>
                <select className="bg-muted border border-border rounded-sm px-3 py-1.5 text-sm text-foreground">
                  <option>Market</option>
                  <option>Limit</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-foreground">Confirm Trades</div>
                  <div className="text-xs text-muted-foreground">Require confirmation before executing trades</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-foreground">Show Extended Hours</div>
                  <div className="text-xs text-muted-foreground">Display pre-market and after-hours data</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-foreground">Risk Warnings</div>
                  <div className="text-xs text-muted-foreground">Show alerts for high-risk trades</div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* Paper Trading */}
          <div className="terminal-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Paper Trading Account</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-muted rounded-sm">
                <div className="text-xs text-muted-foreground mb-1">Current Balance</div>
                <div className="text-xl font-mono font-semibold text-foreground">$125,430.50</div>
              </div>
              <div className="p-4 bg-muted rounded-sm">
                <div className="text-xs text-muted-foreground mb-1">Starting Balance</div>
                <div className="text-xl font-mono font-semibold text-muted-foreground">$100,000.00</div>
              </div>
            </div>
            <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
              Reset Account
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will reset your paper trading balance to $100,000 and clear all trade history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
