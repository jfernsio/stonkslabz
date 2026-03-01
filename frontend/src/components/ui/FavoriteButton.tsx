import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";

interface FavoriteButtonProps {
  symbol: string;
  className?: string;
}

export function FavoriteButton({ symbol, className }: FavoriteButtonProps) {
  const { data: watchlist } = useWatchlist();
  const add = useAddToWatchlist();
  const remove = useRemoveFromWatchlist();
  const { toast } = useToast();

  // derive from query data
  const fetchedFavorite = Array.isArray(watchlist) &&
    watchlist.some((item: any) => item.symbol === symbol);

  // local state to provide instant UI feedback
  const [favorited, setFavorited] = useState(fetchedFavorite);

  // keep local state in sync when query updates
  useEffect(() => {
    setFavorited(fetchedFavorite);
  }, [fetchedFavorite]);

  const handleToggle = useCallback(async () => {
    // optimistic update
    setFavorited((prev) => !prev);
    try {
      if (favorited) {
        await remove.mutateAsync(symbol);
        toast({
          title: "Removed",
          description: `${symbol} removed from watchlist`,
        });
      } else {
        await add.mutateAsync(symbol);
        toast({
          title: "Added",
          description: `${symbol} added to watchlist`,
        });
      }
    } catch (e: any) {
      // revert on error
      setFavorited(fetchedFavorite);
      toast({
        title: "Error",
        description: e?.message || "Failed to update watchlist",
        variant: "destructive",
      });
    }
  }, [symbol, favorited, add, remove, toast, fetchedFavorite]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6", className)}
      onClick={(e) => {
        e.stopPropagation();
        handleToggle();
      }}
    >
      <Star
        className={cn(
          "w-4 h-4",
          favorited ? "text-warning" : "text-muted-foreground hover:text-warning"
        )}
      />
    </Button>
  );
}
