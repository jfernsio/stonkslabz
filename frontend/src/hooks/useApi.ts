
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "http://localhost:8000/api/v1";

// Generic fetch function with credentials
async function fetchApi(
  endpoint: string,
  options?: {
    method?: string;
    body?: string;
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
    queryFn: () => fetchApi("/portfolio"),
    ...defaultQueryOptions,
  });
};

// Market Data Hooks
export const useStocks = () => {
  return useQuery({
    queryKey: ["stocks"],
    queryFn: () => fetchApi("/get-stocks"),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useCryptos = () => {
  return useQuery({
    queryKey: ["cryptos"],
    queryFn: () => fetchApi("/get-cryptos"),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useGainers = () => {
  return useQuery({
    queryKey: ["gainers"],
    queryFn: () => fetchApi("/get-gainers"),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useLosers = () => {
  return useQuery({
    queryKey: ["losers"],
    queryFn: () => fetchApi("/get-losers"),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// IPO Data Hook
export const useIPO = () => {
  return useQuery({
    queryKey: ["ipo"],
    queryFn: () => fetchApi("/get-ipo"),
    staleTime: 60 * 60 * 1000, // 1 hour for IPO data
    retry: 1,
  });
};

// Insider Activity Hooks
export const useInsiderTransactions = () => {
  return useQuery({
    queryKey: ["insider-transactions"],
    queryFn: () => fetchApi("/get-insider-data"),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
};

export const useInsiderSentiment = () => {
  return useQuery({
    queryKey: ["insider-sentiment"],
    queryFn: () => fetchApi("/get-insider-sentiment"),
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
};

// History Hook
export const useHistory = () => {
  return useQuery({
    queryKey: ["history"],
    queryFn: () => fetchApi("/history"),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
};

// Watchlist Hooks
export const useWatchlist = () => {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: () => fetchApi("/watchlist"),
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
        body: JSON.stringify({ symbol }),
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
    queryFn: () => fetchApi("/leaderboard"),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
};

// User Rank Hook
export const useUserRank = () => {
  return useQuery({
    queryKey: ["user-rank"],
    queryFn: () => fetchApi("/leaderboard/rank"),
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
    queryFn: () => fetchApi(`/get-ticker/${symbol}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!symbol,
  });
};

