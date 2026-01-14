import { Sparkles } from "lucide-react";

export function AIInsightCard() {
  return (
    <div className="terminal-card p-4 relative overflow-hidden">
      {/* Gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">AI Market Summary</h3>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Markets showing <span className="text-success font-medium">bullish momentum</span> with
          tech sector leading gains. Federal Reserve's dovish stance supporting risk assets.
          Watch for <span className="text-primary font-medium">NVDA</span> and{" "}
          <span className="text-primary font-medium">AAPL</span> earnings this week.
        </p>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Sentiment:</span>
            <span className="text-success font-medium">Bullish</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">Risk:</span>
            <span className="text-warning font-medium">Moderate</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground italic">
            ⚡ AI-generated • This is simulated data for educational purposes
          </span>
        </div>
      </div>
    </div>
  );
}
