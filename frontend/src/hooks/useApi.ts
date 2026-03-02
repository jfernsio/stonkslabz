import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Generic fetch function with credentials
async function fetchApi(
  endpoint: string,
  options?: {
    method?: string;
    body?: string;
    credentials?: RequestCredentials;
  }
) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: options?.body,
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized");
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to fetch ${endpoint}`);
  }
  
  const data = await response.json();
  return data;
}

// Default query options for caching
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: 1,
  refetchInterval: 30 * 1000, // Refetch every 30 seconds for live data
};

// Portfolio Hook
export const usePortfolio = () => {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: () => fetchApi("/portfolio", {credentials: "include" }),
    ...defaultQueryOptions,
  });
};

// Market Data Hooks
export const useStocks = () => {
  return useQuery({
    queryKey: ["stocks"],
    queryFn: () => fetchApi("/stocks", {credentials: "include" }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useCryptos = () => {
  return useQuery({
    queryKey: ["cryptos"],
    queryFn: () => fetchApi("/cryptos", {credentials: "include" }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useGainers = () => {
  return useQuery({
    queryKey: ["gainers"],
    queryFn: () => fetchApi("/gainers", {credentials: "include" }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useLosers = () => {
  return useQuery({
    queryKey: ["losers"],
    queryFn: () => fetchApi("/losers", {credentials: "include" }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// IPO Data Hook
export const useIPO = () => {
  return useQuery({
    queryKey: ["ipo"],
    queryFn: () => fetchApi("/ipo", {credentials: "include" }),
    staleTime: 60 * 60 * 1000, // 1 hour for IPO data
    retry: 1,
  });
};

// Insider Activity Hooks
export const useInsiderTransactions = () => {
  return useQuery({
    queryKey: ["insider-transactions"],
    queryFn: () => fetchApi("/insider-data", {credentials: "include" }),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
};

export const useInsiderSentiment = () => {
  return useQuery({
    queryKey: ["insider-sentiment"],
    queryFn: () => fetchApi("/insider-sentiment", {credentials: "include" }),
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
};

// History Hook
export const useHistory = () => {
  return useQuery({
    queryKey: ["history"],
    queryFn: () => fetchApi("/history", {credentials: "include" }),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
};

// Watchlist Hooks
export const useWatchlist = () => {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: () => fetchApi("/watchlist", {credentials: "include" }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (symbol: string) => 
      fetchApi("/watchlist", {
        method: "POST",
        credentials: "include" ,
        body: JSON.stringify({ symbol }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
};

// remove hook (DELETE)
export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (symbol: string) =>
      fetchApi(`/watchlist/${symbol}`, {
        method: "DELETE",
        credentials: "include" 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
};

// Leaderboard Hook
export const useLeaderboard = () => {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => fetchApi("/leaderboard", {credentials: "include" }),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
};

// User Rank Hook
export const useUserRank = () => {
  return useQuery({
    queryKey: ["user-rank"],
    queryFn: () => fetchApi("/leaderboard/rank", {credentials: "include" }),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
};

// Trade Hooks - Buy/Sell Stock
export const useBuyStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ symbol, quantity }: { symbol: string; quantity: number }) => 
      fetchApi(`/buy-stock/${symbol}/${quantity}`, {
        method: "POST",
        credentials: "include" 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
};

export const useSellStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ symbol, quantity }: { symbol: string; quantity: number }) => 
      fetchApi(`/sell-stock/${symbol}/${quantity}`, {
        method: "POST",
        credentials: "include" 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
};

// Trade Hooks - Buy/Sell Crypto
export const useBuyCrypto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ symbol, quantity }: { symbol: string; quantity: number }) => 
      fetchApi(`/buy-crypto/${symbol}/${quantity}`, {
        method: "POST",
        credentials: "include" 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
};

export const useSellCrypto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ symbol, quantity }: { symbol: string; quantity: number }) => 
      fetchApi(`/sell-crypto/${symbol}/${quantity}`, {
        method: "POST",
        credentials: "include" 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
};

// Get Ticker History (for charts)
export const useTickerHistory = (symbol: string) => {
  return useQuery({
    queryKey: ["ticker", symbol],
    queryFn: () => fetchApi(`/ticker/${symbol}`, {credentials: "include" }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!symbol,
  });
};

export const useLogout = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => fetchApi("/logout", {credentials: "include" }),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/login";
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  return { logout: mutate, isPending };
};