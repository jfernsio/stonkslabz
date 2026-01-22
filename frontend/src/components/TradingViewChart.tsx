import { useEffect, useRef, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Clock, BarChart3 } from 'lucide-react';

export default function LiveCryptoChart({ symbol , type  }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const wsRef = useRef(null);

  const [status, setStatus] = useState('Initializing...');
  const [connected, setConnected] = useState(false);
  const [currentPrice, setCurrentPrice] = useState('-');
  const [priceChange, setPriceChange] = useState(0);
  const [high24h, setHigh24h] = useState('-');
  const [low24h, setLow24h] = useState('-');
  const [volume, setVolume] = useState('-');
  const [lastUpdate, setLastUpdate] = useState('-');
  const [candleCount, setCandleCount] = useState(0);
  const [chartError, setChartError] = useState(null);

  const candlesMap = useRef(new Map());
  const high24Ref = useRef(0);
  const low24Ref = useRef(Infinity);
  const initialPriceRef = useRef(null);

  const isCrypto = type === 'crypto';

  // Initialize chart with dynamic import
  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart = null;
    let series = null;

    const initChart = async () => {
      try {
        setChartError(null);
        
        // Dynamic import of lightweight-charts
        const LightweightCharts = await import('lightweight-charts');
        const { createChart, ColorType, CrosshairMode } = LightweightCharts;

        chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 450,
          layout: {
            background: { type: ColorType.Solid, color: '#0a0a0a' },
            textColor: '#d1d4dc',
          },
          grid: {
            vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
            horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
          },
          crosshair: {
            mode: CrosshairMode.Normal,
          },
          rightPriceScale: {
            borderColor: 'rgba(197, 203, 206, 0.4)',
          },
          timeScale: {
            borderColor: 'rgba(197, 203, 206, 0.4)',
            timeVisible: true,
            secondsVisible: false,
          },
        });

        // Try different methods for adding candlestick series
        try {
          series = chart.addSeries(series,{
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
          });
        } catch (e) {
          console.warn('addCandlestickSeries failed, trying alternative:', e);
          // Fallback for older versions
          series = chart.addSeries('Candlestick', {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
          });
        }

        chartRef.current = chart;
        seriesRef.current = series;

        const handleResize = () => {
          if (chartContainerRef.current && chart) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (err) {
        console.error('Chart initialization error:', err);
        setChartError('Chart display unavailable (data still loading)');
        setStatus('Chart Error - Data Collecting');
      }
    };

    initChart();

    return () => {
      if (chart) {
        try {
          chart.remove();
        } catch (e) {
          console.warn('Chart cleanup error:', e);
        }
      }
    };
  }, []);

  // Load historical data and connect WebSocket
  useEffect(() => {
    if (!isCrypto) {
      setStatus('Stock charts not yet supported');
      return;
    }

    // Reset state
    candlesMap.current.clear();
    high24Ref.current = 0;
    low24Ref.current = Infinity;
    initialPriceRef.current = null;
    setCandleCount(0);
    setHigh24h('-');
    setLow24h('-');
    setCurrentPrice('-');
    setVolume('-');
    setPriceChange(0);

    const loadHistoricalData = async () => {
      try {
        setStatus('Loading historical data...');
        
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1m&limit=100`
        );
        
        if (!res.ok) throw new Error('Failed to fetch historical data');

        const data = await res.json();

        if (data && data.length > 0) {
          data.forEach((kline) => {
            const time = Math.floor(kline[0] / 1000);
            const candle = {
              time,
              open: parseFloat(kline[1]),
              high: parseFloat(kline[2]),
              low: parseFloat(kline[3]),
              close: parseFloat(kline[4]),
            };

            candlesMap.current.set(time, candle);
            
            try {
              if (seriesRef.current) {
                seriesRef.current.update(candle);
              }
            } catch (err) {
              console.warn('Failed to update chart (will retry):', err);
            }

            if (candle.high > high24Ref.current) {
              high24Ref.current = candle.high;
              setHigh24h(candle.high.toFixed(2));
            }
            if (candle.low < low24Ref.current) {
              low24Ref.current = candle.low;
              setLow24h(candle.low.toFixed(2));
            }
          });

          // Set initial price
          const lastCandle = data[data.length - 1];
          const lastPrice = parseFloat(lastCandle[4]);
          initialPriceRef.current = lastPrice;
          setCurrentPrice(lastPrice.toFixed(2));
          setCandleCount(candlesMap.current.size);
          setStatus('Historical data loaded');
        }
      } catch (err) {
        console.error('Historical data error:', err);
        setStatus('Failed to load history (will retry with live data)');
      }
    };

    loadHistoricalData();

    // Connect WebSocket - ALWAYS TRY TO CONNECT
    const connectWebSocket = () => {
      try {
        setStatus('Connecting to live stream...');
        
        const ws = new WebSocket(
          `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@kline_1m`
        );

        ws.onopen = () => {
          setStatus('Connected - Live Data');
          setConnected(true);
          console.log('WebSocket connected successfully');
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (!msg.k) return;

            const k = msg.k;
            const time = Math.floor(k.t / 1000);

            const candle = {
              time,
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
            };

            candlesMap.current.set(time, candle);
            
            // Try to update chart, but don't fail if chart has issues
            try {
              if (seriesRef.current) {
                seriesRef.current.update(candle);
              }
            } catch (chartErr) {
              // Silently fail - data is still being collected
            }

            const currentClose = parseFloat(k.c);
            setCurrentPrice(currentClose.toFixed(2));
            setVolume(parseFloat(k.v).toFixed(2));
            setLastUpdate(new Date().toLocaleTimeString());
            setCandleCount(candlesMap.current.size);

            // Calculate price change
            if (initialPriceRef.current) {
              const change = ((currentClose - initialPriceRef.current) / initialPriceRef.current) * 100;
              setPriceChange(change);
            }

            if (candle.high > high24Ref.current) {
              high24Ref.current = candle.high;
              setHigh24h(candle.high.toFixed(2));
            }
            if (candle.low < low24Ref.current) {
              low24Ref.current = candle.low;
              setLow24h(candle.low.toFixed(2));
            }
          } catch (err) {
            console.error('WebSocket message parse error:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setStatus('Connection error (retrying...)');
          setConnected(false);
        };

        ws.onclose = () => {
          console.log('WebSocket closed, reconnecting in 3s...');
          setStatus('Disconnected (reconnecting...)');
          setConnected(false);
          
          // Auto-reconnect after 3 seconds
          setTimeout(() => {
            connectWebSocket();
          }, 3000);
        };

        wsRef.current = ws;
      } catch (err) {
        console.error('WebSocket connection error:', err);
        setStatus('Connection failed (will retry)');
        
        // Retry connection after 5 seconds
        setTimeout(() => {
          connectWebSocket();
        }, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbol, isCrypto]);

  return (
    <div className="w-full h-full bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{symbol}/USDT</h2>
              <p className="text-xs text-zinc-500">Live Trading Chart</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              connected ? 'bg-green-500/10' : 'bg-yellow-500/10'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
              }`} />
              <span className={`text-xs font-medium ${
                connected ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-zinc-900/50">
        <div className="space-y-1">
          <div className="text-xs text-zinc-500">Current Price</div>
          <div className="text-lg font-bold text-white flex items-center gap-1">
            ${currentPrice}
            {priceChange !== 0 && (
              priceChange > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )
            )}
          </div>
          {priceChange !== 0 && (
            <div className={`text-xs ${priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-xs text-zinc-500">24h High</div>
          <div className="text-lg font-bold text-green-500">${high24h}</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-zinc-500">24h Low</div>
          <div className="text-lg font-bold text-red-500">${low24h}</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-zinc-500">Volume</div>
          <div className="text-lg font-bold text-blue-500">{volume}</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last Update
          </div>
          <div className="text-sm font-mono text-zinc-400">{lastUpdate}</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Candles
          </div>
          <div className="text-lg font-bold text-purple-500">{candleCount}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {chartError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2">
            <p className="text-xs text-yellow-500">
              {chartError} - Live data is still being collected
            </p>
          </div>
        )}
        {!chartError && (
          <div ref={chartContainerRef} className="w-full" />
        )}
        {chartError && (
          <div className="w-full h-[450px] flex items-center justify-center bg-zinc-900/30">
            <div className="text-center space-y-2">
              <BarChart3 className="w-12 h-12 text-zinc-700 mx-auto" />
              <p className="text-sm text-zinc-500">Chart visualization unavailable</p>
              <p className="text-xs text-zinc-600">Live data is still being collected above</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/30">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Connected to Binance WebSocket • Real-time 1m Candlesticks</span>
          <span>Interval: 1 minute</span>
        </div>
      </div>
    </div>
  );
}