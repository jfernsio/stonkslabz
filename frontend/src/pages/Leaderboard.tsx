import { useEffect, useState } from "react";
import { Trophy, Users, TrendingUp, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  user_id: number;
  username: string;
  balance: number;
  rank: number;
}

export default function Leaderboard() {
  const { toast } = useToast();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeaderboard = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch("http://localhost:8000/api/v1/leaderboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === "success" && result.data) {
        setLeaderboardData(result.data);
        if (showRefreshToast) {
          toast({
            title: "Refreshed",
            description: "Leaderboard data updated",
          });
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleRefresh = () => {
    fetchLeaderboard(true);
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Leaderboard</h1>
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
          <h1 className="text-2xl font-semibold text-foreground">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Top traders ranked by portfolio balance</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Leaderboard Table */}
      <div className="terminal-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-warning" />
            Top Traders
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-sm font-mono bg-primary/10 text-primary">
            {leaderboardData.length} PLAYERS
          </span>
        </div>
        <div className="divide-y divide-border/50">
          {leaderboardData.length > 0 ? (
            leaderboardData.map((entry) => (
              <div
                key={entry.user_id}
                className={cn(
                  "px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors",
                  entry.rank <= 3 && "bg-accent/20"
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center min-w-10">
                    {getMedalIcon(entry.rank) ? (
                      <span className="text-lg">{getMedalIcon(entry.rank)}</span>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground font-semibold">
                        #{entry.rank}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">{entry.username}</div>
                    <div className="text-xs text-muted-foreground">User ID: {entry.user_id}</div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <div className="font-mono text-sm font-semibold text-foreground">
                      ${entry.balance.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No leaderboard data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
