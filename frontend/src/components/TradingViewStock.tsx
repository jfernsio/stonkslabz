import { useEffect, useRef, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Clock, BarChart3, Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react'; // Added AlertCircle
import { createChart, IChartApi, CandlestickData, ColorType, CrosshairMode, Time, CandlestickSeries } from 'lightweight-charts';

interface StpckChartProps {
  symbol: string;
  interval?: string;
}

interface ChartStats {
  currentPrice: string;
  priceChange: number;
  high24h: string;
  low24h: string;
  volume: string;
  lastUpdate: string;
  candleCount: number;
}

export default function StockChart({ symbol, interval = '1m' }: StpckChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const candlesMap = useRef<Map<number, CandlestickData<Time>>>(new Map());
  const initialPriceRef = useRef<number | null>(null);
  const isUnmounting = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [hasHistoricalData, setHasHistoricalData] = useState(false);
  // 1. Add dedicated loading state
  const [isLoading, setIsLoading] = useState(true); 
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [stats, setStats] = useState<ChartStats>({
    currentPrice: '-',
    priceChange: 0,
    high24h: '-',
    low24h: '-',
    volume: '-',
    lastUpdate: '-',
    candleCount: 0,
  });

  // Cleanup WebSocket connection
  const cleanupWebSocket = () => {
    if (wsRef.current) {
      console.log(`Closing WebSocket for ${symbol}/${interval}`);
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: 'rgba(139, 92, 246, 0.05)' },
        horzLines: { color: 'rgba(139, 92, 246, 0.05)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(139, 92, 246, 0.3)', width: 1 },
        horzLine: { color: 'rgba(139, 92, 246, 0.3)', width: 1 },
      },
      rightPriceScale: { borderColor: 'rgba(139, 92, 246, 0.1)' },
      timeScale: {
        borderColor: 'rgba(139, 92, 246, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current && chart) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart) chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Function to load historical data
  const loadHistoricalData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true); // Start loading
        setStatus('Loading chart data...');
      }
      
      candlesMap.current.clear();
      
      const endpoint = `http://localhost:8000/api/v1/get-ticker/${symbol.toUpperCase()}`;
      let data = null;
      let success = false;

      try {
        const res = await fetch(endpoint,{
          credentials: "include",
        });
        if (res.ok) {
          data = await res.json();
          console.log(`Loaded data from ${endpoint}`, data);
          success = true;
        } else {
            console.warn(`Fetch returned status: ${res.status}`);
        }
      } catch (err) {
        console.log(`Failed to fetch from ${endpoint}:`, err);
      }
      

      if (!success || !data) {
        throw new Error('Failed to load data from endpoint');
      }

      console.log('Data type:', typeof data, 'Is Array:', Array.isArray(data), 'First item:', data[0] || data);

      // Handle different response formats
      let candlesList: any[] = [];
      
      if (Array.isArray(data)) {
        // Check if it's array of objects with time property
        if (data.length > 0 && data[0] && typeof data[0] === 'object' && ('time' in data[0])) {
          // Backend returns objects with {time, open, high, low, close, volume}
          console.log('Detected object format with time property');
          candlesList = data;
        } else if (data.length > 0 && Array.isArray(data[0])) {
          // Array format [timestamp, open, high, low, close, volume]
          console.log('Detected array format');
          candlesList = data.map((kline: any[]) => ({
            time: kline[0],
            open: parseFloat(String(kline[1])),
            high: parseFloat(String(kline[2])),
            low: parseFloat(String(kline[3])),
            close: parseFloat(String(kline[4])),
            volume: parseFloat(String(kline[5])) || 0,
          }));
        } else if (data.length > 0 && data[0] && 'k' in data[0]) {
          console.log('Detected kline format');
          candlesList = data.map((item: any) => {
            const k = item.k || item;
            return {
              time: k.t || k[0],
              open: parseFloat(String(k.o || k[1])),
              high: parseFloat(String(k.h || k[2])),
              low: parseFloat(String(k.l || k[3])),
              close: parseFloat(String(k.c || k[4])),
              volume: parseFloat(String(k.v || k[5])) || 0,
            };
          });
        } else {
          console.warn('Could not detect array format, data:', data);
        }
      } else if (data && typeof data === 'object') {
        // Check if it's an object with candles or klines property
        if (data.data && Array.isArray(data.data)) {
          console.log('Detected data wrapper object');
          candlesList = data.data;
        } else if (data.candles && Array.isArray(data.candles)) {
          console.log('Detected candles property');
          candlesList = data.candles;
        } else if (data.klines && Array.isArray(data.klines)) {
          console.log('Detected klines property');
          candlesList = data.klines;
        } else {
          console.warn('Unknown object format:', data);
        }
      }

      console.log('Processed candlesList length:', candlesList.length, 'First candle:', candlesList[0] || 'empty');

      if (!Array.isArray(candlesList) || candlesList.length === 0) {
        console.error('candlesList validation failed. Type:', typeof candlesList, 'Is Array:', Array.isArray(candlesList), 'Length:', candlesList?.length);
        throw new Error('No valid data received');
      }

      const candles: CandlestickData[] = [];
      let high24h = 0;
      let low24h = Infinity;
      let totalVolume = 0;

      candlesList.forEach((item: any) => {
        let time: number;
        let open: number;
        let high: number;
        let low: number;
        let close: number;
        let volume: number = 0;

        // Handle object format {time, open, high, low, close, volume}
        if (item.time && typeof item.time === 'string') {
          // Convert date string to timestamp
          time = Math.floor(new Date(item.time).getTime() / 1000);
          open = parseFloat(String(item.open));
          high = parseFloat(String(item.high));
          low = parseFloat(String(item.low));
          close = parseFloat(String(item.close));
          volume = item.volume ? parseFloat(String(item.volume)) : 0;
        } else {
          // Handle array format
          time = Math.floor(item[0] / 1000);
          open = parseFloat(String(item[1]));
          high = parseFloat(String(item[2]));
          low = parseFloat(String(item[3]));
          close = parseFloat(String(item[4]));
          volume = item[5] ? parseFloat(String(item[5])) : 0;
        }

        const candle: CandlestickData = {
          time: time as CandlestickData['time'],
          open,
          high,
          low,
          close,
        };

        candlesMap.current.set(time, candle);
        candles.push(candle);

        if (high > high24h) high24h = high;
        if (low < low24h) low24h = low;
        totalVolume += volume;
      });

      if (seriesRef.current) {
        seriesRef.current.setData(candles);
        setHasHistoricalData(true);
      }

      const lastCandle = candles[candles.length - 1];
      const firstCandle = candles[0];
      initialPriceRef.current = firstCandle.open;
      
      const priceChange = ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100;

      setStats({
        currentPrice: lastCandle.close.toFixed(2),
        priceChange,
        high24h: high24h.toFixed(2),
        low24h: low24h.toFixed(2),
        volume: totalVolume.toFixed(2),
        lastUpdate: new Date().toLocaleTimeString(),
        candleCount: candles.length,
      });

      setIsLoading(false); // Stop loading on success
      return true;
    } catch (error) {
      console.error('Historical data error:', error);
      setStatus('Data Load Failed');
      setIsLoading(false); // Stop loading on error
      return false;
    }
  };

  // Connect WebSocket logic (Kept same, just hiding for brevity)
  const connectWebSocket = () => {
    if (isUnmounting.current) return;
    cleanupWebSocket();
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@kline_${interval}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (isUnmounting.current) { ws.close(); return; }
      setStatus('Live');
      setConnected(true);
      setRetryCount(0);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (!msg.k) return;
        const k = msg.k;
        const time = Math.floor(k.t / 1000) as Time;
        const candle: CandlestickData = {
          time,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
        };
        candlesMap.current.set(time as number, candle);
        if (seriesRef.current) seriesRef.current.update(candle);
        
        const currentClose = parseFloat(k.c);
        let priceChange = 0;
        if (initialPriceRef.current) {
          priceChange = ((currentClose - initialPriceRef.current) / initialPriceRef.current) * 100;
        }

        setStats(prev => ({
          ...prev,
          currentPrice: currentClose.toFixed(2),
          priceChange,
          volume: parseFloat(k.v).toFixed(2),
          lastUpdate: new Date().toLocaleTimeString(),
          candleCount: candlesMap.current.size,
        }));
      } catch (err) { console.error(err); }
    };

    ws.onerror = (error) => {
        if(!isUnmounting.current) {
            setStatus('Connection error');
            setConnected(false);
        }
    };
    ws.onclose = (event) => {
        if(isUnmounting.current) return;
        setConnected(false);
        if (event.code !== 1000) {
            const newRetryCount = retryCount + 1;
            setRetryCount(newRetryCount);
            if (newRetryCount <= 3) {
                setStatus(`Reconnecting (${newRetryCount}/3)...`);
                reconnectTimeoutRef.current = setTimeout(() => connectWebSocket(), 2000 * newRetryCount);
            } else setStatus('Disconnected');
        }
    };
    wsRef.current = ws;
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setStatus('Retrying...');
    const historicalSuccess = await loadHistoricalData(true); // Pass true to show loading
    if (historicalSuccess) {
      setTimeout(() => { if (!isUnmounting.current) connectWebSocket(); }, 1000);
    }
    setIsRetrying(false);
  };

  useEffect(() => {
    isUnmounting.current = false;
    setHasHistoricalData(false);
    setIsLoading(true); // Reset loading state on symbol change
    setRetryCount(0);

    const initializeChart = async () => {
      const historicalSuccess = await loadHistoricalData();
      if (!isUnmounting.current) {
        if (historicalSuccess) {
          setStatus('Connecting to live feed...');
          connectWebSocket();
        } else {
            // Even if historical data fails, we might want to try WS, 
            // but usually charts need base data.
            // Status is already set to 'Data Load Failed' in catch block
        }
      }
    };
    initializeChart();
    return () => {
      isUnmounting.current = true;
      cleanupWebSocket();
    };
  }, [symbol, interval]);

  return (
    <div className="w-full bg-card rounded-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground font-mono">{symbol}/USD</h2>
              <p className="text-xs text-muted-foreground">Live Trading Chart</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Show Retry Button if disconnected OR if data load failed */}
            {(!connected || !hasHistoricalData) && !isLoading && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-sm hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry Connection'}
              </button>
            )}
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm ${
              connected ? 'bg-success/10' : 
              hasHistoricalData ? 'bg-warning/10' : 'bg-destructive/10'
            }`}>
              {connected ? (
                <Wifi className="w-3 h-3 text-success" />
              ) : hasHistoricalData ? (
                <WifiOff className="w-3 h-3 text-warning" />
              ) : (
                <WifiOff className="w-3 h-3 text-destructive" />
              )}
              <div className={`w-2 h-2 rounded-full ${
                connected ? 'bg-success animate-pulse' : 
                hasHistoricalData ? 'bg-warning' : 'bg-destructive'
              }`} />
              <span className={`text-xs font-medium font-mono ${
                connected ? 'text-success' : 
                hasHistoricalData ? 'text-warning' : 'text-destructive'
              }`}>
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 p-4 bg-muted/30">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Current Price</div>
          <div className="text-lg font-bold text-foreground font-mono flex items-center gap-1">
            ${stats.currentPrice}
            {stats.priceChange !== 0 && (
              stats.priceChange > 0 ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />
            )}
          </div>
        </div>
        {/* ... (Other stat items remain the same) ... */}
      </div>

      {/* Chart Container */}
      <div className="relative">
        <div ref={containerRef} className="w-full" />
        
        {/* 2. Modified Overlay Logic */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center p-4">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        )}

        {/* 3. New Error State Overlay */}
        {!isLoading && !hasHistoricalData && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-10">
            <div className="text-center p-4">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-foreground font-medium mb-1">Unable to load chart data</p>
              <p className="text-xs text-muted-foreground mb-4">Please check your connection or try again</p>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>
            {connected ? 'Live WebSocket' : 'Historical Data'} • 
            {connected ? ` Real-time ${interval} Candlesticks` : ' Static Chart'}
          </span>
          <span>Interval: {interval}</span>
        </div>
      </div>
    </div>
  );
}