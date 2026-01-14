import { useState } from "react";
import { Sparkles, Send, TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const insights = [
  {
    title: "Market Sentiment",
    status: "Bullish",
    statusType: "success",
    description: "Overall market sentiment remains positive with strong institutional buying. Tech sector leading gains with AI-related stocks showing momentum.",
    confidence: 78,
  },
  {
    title: "NVDA Outlook",
    status: "Strong Buy",
    statusType: "success",
    description: "NVIDIA continues to dominate the AI chip market. Recent earnings exceeded expectations. Price target: $220 within 6 months.",
    confidence: 85,
  },
  {
    title: "BTC Analysis",
    status: "Hold",
    statusType: "warning",
    description: "Bitcoin showing consolidation near $67K. ETF inflows remain steady but momentum slowing. Watch $65K support level.",
    confidence: 65,
  },
  {
    title: "Risk Assessment",
    status: "Moderate",
    statusType: "warning",
    description: "Elevated valuations in growth stocks. Fed rate decision upcoming. Consider diversifying into defensive sectors.",
    confidence: 72,
  },
];

const chatMessages = [
  { role: "assistant", content: "Hello! I'm your AI trading assistant. I can help you analyze stocks, understand market trends, and provide insights. What would you like to know?" },
];

export default function AIInsights() {
  const [messages, setMessages] = useState(chatMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([
      ...messages,
      { role: "user", content: input },
      { role: "assistant", content: "This is a simulated response. In a real application, this would connect to an AI model for analysis. I would analyze your question about \"" + input + "\" and provide relevant market insights." },
    ]);
    setInput("");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">AI Insights</h1>
          <p className="text-sm text-muted-foreground">AI-powered market analysis and recommendations</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 text-warning rounded-sm text-xs">
          <AlertTriangle className="w-4 h-4" />
          <span>Simulated data for educational purposes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Insights Cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Market Analysis</h2>
          {insights.map((insight, index) => (
            <div key={index} className="terminal-card p-4 relative overflow-hidden">
              <div
                className={cn(
                  "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10",
                  insight.statusType === "success" && "bg-success",
                  insight.statusType === "warning" && "bg-warning",
                  insight.statusType === "destructive" && "bg-destructive"
                )}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm text-foreground">{insight.title}</h3>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-sm font-medium",
                      insight.statusType === "success" && "bg-success/10 text-success",
                      insight.statusType === "warning" && "bg-warning/10 text-warning",
                      insight.statusType === "destructive" && "bg-destructive/10 text-destructive"
                    )}
                  >
                    {insight.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{insight.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        insight.statusType === "success" && "bg-success",
                        insight.statusType === "warning" && "bg-warning",
                        insight.statusType === "destructive" && "bg-destructive"
                      )}
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{insight.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Chat */}
        <div className="terminal-card flex flex-col h-[500px]">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Ask me about markets</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-3 py-2 rounded-sm text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about stocks, crypto, or market trends..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="bg-muted border-border"
              />
              <Button onClick={handleSend} size="icon" className="bg-primary text-primary-foreground">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              AI responses are simulated for demonstration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
