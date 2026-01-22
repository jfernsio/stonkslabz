import { useEffect, useRef, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Clock, BarChart3, Wifi, WifiOff } from 'lucide-react';
import { createChart, IChartApi, CandlestickData, ColorType, CrosshairMode, Time, CandlestickSeries } from 'lightweight-charts';

interface CryptoChartProps {
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

export default function CryptoChart({ symbol, interval = '1m' }: CryptoChartProps) {
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

    // Clear any pending reconnect timeout
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
      rightPriceScale: {
        borderColor: 'rgba(139, 92, 246, 0.1)',
      },
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
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Load data and connect WebSocket when symbol or interval changes
  useEffect(() => {
    // Cleanup previous WebSocket connection
    cleanupWebSocket();
    
    // Reset states
    candlesMap.current.clear();
    initialPriceRef.current = null;
    isUnmounting.current = false;
    setConnected(false);
    setStats({
      currentPrice: '-',
      priceChange: 0,
      high24h: '-',
      low24h: '-',
      volume: '-',
      lastUpdate: '-',
      candleCount: 0,
    });

    let high24h = 0;
    let low24h = Infinity;

    const loadHistoricalData = async () => {
      try {
        setStatus('Loading chart data...');
        
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}USDT&interval=${interval}&limit=500`
        );
        
        if (!res.ok) throw new Error('Failed to fetch data');

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No data received');
        }

        const candles: CandlestickData[] = [];
        
        data.forEach((kline: number[]) => {
          const time = Math.floor(kline[0] / 1000) as CandlestickData['time'];
          const candle: CandlestickData = {
            time,
            open: parseFloat(String(kline[1])),
            high: parseFloat(String(kline[2])),
            low: parseFloat(String(kline[3])),
            close: parseFloat(String(kline[4])),
          };

          candlesMap.current.set(time as number, candle);
          candles.push(candle);

          if (candle.high > high24h) high24h = candle.high;
          if (candle.low < low24h) low24h = candle.low;
        });

        if (seriesRef.current) {
          seriesRef.current.setData(candles);
        }

        const lastCandle = candles[candles.length - 1];
        initialPriceRef.current = lastCandle.close;
        
        setStats(prev => ({
          ...prev,
          currentPrice: lastCandle.close.toFixed(2),
          high24h: high24h.toFixed(2),
          low24h: low24h.toFixed(2),
          candleCount: candles.length,
        }));

        setStatus('Connecting to live feed...');
        
        // Only connect WebSocket if component is still mounted
        if (!isUnmounting.current) {
          connectWebSocket();
        }
      } catch (error) {
        console.error('Historical data error:', error);
        setStatus('Failed to load data');
        
        // Try to connect WebSocket anyway for live data
        if (!isUnmounting.current) {
          connectWebSocket();
        }
      }
    };

    const connectWebSocket = () => {
      // Prevent connection if component is unmounting
      if (isUnmounting.current) {
        return;
      }

      // Cleanup any existing connection first
      cleanupWebSocket();

      const ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@kline_${interval}`
      );

      ws.onopen = () => {
        if (isUnmounting.current) {
          ws.close();
          return;
        }
        
        setStatus('Live');
        setConnected(true);
        console.log(`WebSocket connected for ${symbol}/${interval}`);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (!msg.k) return;

          const k = msg.k;
          const time = Math.floor(k.t / 1000) as CandlestickData['time'];

          const candle: CandlestickData = {
            time,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
          };

          candlesMap.current.set(time as number, candle);

          if (seriesRef.current) {
            seriesRef.current.update(candle);
          }

          const currentClose = parseFloat(k.c);
          let priceChange = 0;
          
          if (initialPriceRef.current) {
            priceChange = ((currentClose - initialPriceRef.current) / initialPriceRef.current) * 100;
          }

          if (candle.high > high24h) high24h = candle.high;
          if (candle.low < low24h) low24h = candle.low;

          setStats(prev => ({
            ...prev,
            currentPrice: currentClose.toFixed(2),
            priceChange,
            high24h: high24h.toFixed(2),
            low24h: low24h.toFixed(2),
            volume: parseFloat(k.v).toFixed(2),
            lastUpdate: new Date().toLocaleTimeString(),
            candleCount: candlesMap.current.size,
          }));
        } catch (err) {
          console.error('WebSocket message error:', err);
        }
      };

      ws.onerror = (error) => {
        if (isUnmounting.current) return;
        
        console.error('WebSocket error:', error);
        setStatus('Connection error');
        setConnected(false);
      };

      ws.onclose = (event) => {
        // Don't attempt reconnect if we're unmounting or if this was a manual close
        if (isUnmounting.current) return;
        
        setConnected(false);
        
        if (event.code !== 1000) { // 1000 is normal closure
          setStatus('Disconnected - Reconnecting...');
          
          // Attempt reconnect after delay
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isUnmounting.current) {
              console.log(`Attempting to reconnect WebSocket for ${symbol}/${interval}`);
              connectWebSocket();
            }
          }, 3000);
        } else {
          setStatus('Disconnected');
        }
      };

      wsRef.current = ws;
    };

    loadHistoricalData();

    return () => {
      // Mark as unmounting to prevent reconnects
      isUnmounting.current = true;
      
      // Cleanup WebSocket and any pending timeouts
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
              <h2 className="text-lg font-semibold text-foreground font-mono">{symbol}/USDT</h2>
              <p className="text-xs text-muted-foreground">Live Trading Chart</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm ${
            connected ? 'bg-success/10' : 'bg-warning/10'
          }`}>
            {connected ? (
              <Wifi className="w-3 h-3 text-success" />
            ) : (
              <WifiOff className="w-3 h-3 text-warning" />
            )}
            <div className={`w-2 h-2 rounded-full ${
              connected ? 'bg-success animate-pulse' : 'bg-warning'
            }`} />
            <span className={`text-xs font-medium font-mono ${
              connected ? 'text-success' : 'text-warning'
            }`}>
              {status}
            </span>
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
              stats.priceChange > 0 ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )
            )}
          </div>
          {stats.priceChange !== 0 && (
            <div className={`text-xs font-mono ${stats.priceChange > 0 ? 'text-success' : 'text-destructive'}`}>
              {stats.priceChange > 0 ? '+' : ''}{stats.priceChange.toFixed(2)}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">24h High</div>
          <div className="text-lg font-bold text-success font-mono">${stats.high24h}</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">24h Low</div>
          <div className="text-lg font-bold text-destructive font-mono">${stats.low24h}</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Volume</div>
          <div className="text-lg font-bold text-primary font-mono">{stats.volume}</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last Update
          </div>
          <div className="text-sm font-mono text-muted-foreground">{stats.lastUpdate}</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Candles
          </div>
          <div className="text-lg font-bold text-primary font-mono">{stats.candleCount}</div>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={containerRef} className="w-full" />

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>Binance WebSocket • Real-time {interval} Candlesticks</span>
          <span>Interval: {interval}</span>
        </div>
      </div>
    </div>
  );
}