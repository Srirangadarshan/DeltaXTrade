"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PixelatedBackground from "@/components/pixelated-background"
import { Search, LineChart, CandlestickChart, TrendingUp, Activity, Gauge, BarChart3, ArrowUpDown, Target, ArrowDownUp } from "lucide-react"
import dynamic from "next/dynamic"
import { AIInsights } from "@/components/ai-insights"
import { TechnicalIndicators } from "@/components/technical-indicators"

// Import Plot component with proper typing
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false }) as React.ComponentType<{
  data: any[];
  layout: any;
  config?: any;
  className?: string;
}>

interface StockData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface ForecastData {
  date: string
  yhat: number
  yhat_lower: number
  yhat_upper: number
}

export default function TaskPerformancePage() {
  const [symbol, setSymbol] = useState("")
  const [stockData, setStockData] = useState<StockData[]>([])
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [change24h, setChange24h] = useState<number | null>(null)
  const [volume, setVolume] = useState<number | null>(null)
  const [sma20, setSma20] = useState<number | null>(null)
  const [rsi, setRsi] = useState<number | null>(null)
  const [volatility, setVolatility] = useState<number | null>(null)

  const fetchStockData = async () => {
    if (!symbol) return
    setLoading(true)
    setError("")
    try {
      // Fetch stock data from yfinance API
      const response = await fetch(`/api/yfinance?symbol=${symbol}`)
      if (!response.ok) throw new Error("Failed to fetch stock data")
      const data = await response.json()
      
      // Update state with real-time data
      setStockData(data.historical)
      setCurrentPrice(data.currentPrice)
      setChange24h(data.change24h)
      setVolume(data.volume)
      setSma20(data.indicators.sma20)
      setRsi(data.indicators.rsi)
      setVolatility(data.indicators.volatility)

      // Fetch forecast data
      const forecastResponse = await fetch(`/api/forecast/${symbol}`)
      if (!forecastResponse.ok) throw new Error("Failed to fetch forecast data")
      const forecast = await forecastResponse.json()
      setForecastData(forecast)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchStockData()
  }

  // Chart data configurations
  const candlestickData = {
    x: stockData.slice(-30).map(d => d.date),
    open: stockData.slice(-30).map(d => d.open),
    high: stockData.slice(-30).map(d => d.high),
    low: stockData.slice(-30).map(d => d.low),
    close: stockData.slice(-30).map(d => d.close),
    type: 'candlestick',
    name: symbol,
    increasing: { 
      line: { color: '#26a69a' },
      fillcolor: '#26a69a'
    },
    decreasing: { 
      line: { color: '#ef5350' },
      fillcolor: '#ef5350'
    },
    whiskerwidth: 0.5,
    width: 0.6
  }

  const ohlcData = {
    x: stockData.slice(-30).map(d => d.date),
    open: stockData.slice(-30).map(d => d.open),
    high: stockData.slice(-30).map(d => d.high),
    low: stockData.slice(-30).map(d => d.low),
    close: stockData.slice(-30).map(d => d.close),
    type: 'ohlc',
    name: symbol,
    increasing: { 
      line: { color: '#26a69a' }
    },
    decreasing: { 
      line: { color: '#ef5350' }
    }
  }

  const timeSeriesData = {
    x: stockData.slice(-30).map(d => d.date),
    y: stockData.slice(-30).map(d => d.close),
    type: 'scatter',
    mode: 'lines',
    name: 'Closing Price',
    line: { 
      color: '#3B82F6',
      width: 2
    }
  }

  const volumeData = {
    x: stockData.slice(-30).map(d => d.date),
    y: stockData.slice(-30).map(d => d.volume),
    type: 'bar',
    name: 'Volume',
    marker: { 
      color: '#6B7280',
      opacity: 0.7
    }
  }

  const waterfallData = {
    type: 'waterfall',
    x: stockData.slice(-10).map(d => d.date),
    y: stockData.slice(-10).map(d => d.close - d.open),
    text: stockData.slice(-10).map(d => `$${(d.close - d.open).toFixed(2)}`),
    connector: { line: { color: 'rgba(255,255,255,0.1)' } },
    increasing: { marker: { color: '#10B981' } },
    decreasing: { marker: { color: '#EF4444' } }
  }

  const funnelData = {
    type: 'funnel',
    y: ['High', 'Open', 'Close', 'Low'],
    x: stockData.length > 0 ? [
      Math.max(...stockData.map(d => d.high)),
      stockData[stockData.length - 1].open,
      stockData[stockData.length - 1].close,
      Math.min(...stockData.map(d => d.low))
    ] : [0, 0, 0, 0],
    textinfo: 'value+percent initial',
    marker: {
      colors: ['#3B82F6', '#10B981', '#EF4444', '#6B7280']
    }
  }

  const gaugeData = {
    type: 'indicator',
    mode: 'gauge+number',
    value: currentPrice || 0,
    title: { text: 'Current Price' },
    gauge: {
      axis: { 
        range: [
          Math.min(...stockData.map(d => d.low)),
          Math.max(...stockData.map(d => d.high))
        ]
      },
      bar: { color: '#3B82F6' },
      steps: [
        { range: [0, 100], color: '#1F2937' },
        { range: [100, 200], color: '#374151' }
      ]
    }
  }

  const bulletData = {
    type: 'indicator',
    mode: 'number+gauge',
    value: currentPrice || 0,
    delta: { 
      reference: stockData.length > 1 ? stockData[stockData.length - 2].close : 0,
      increasing: { color: '#10B981' },
      decreasing: { color: '#EF4444' }
    },
    gauge: {
      shape: 'bullet',
      axis: { 
        range: [
          Math.min(...stockData.map(d => d.low)),
          Math.max(...stockData.map(d => d.high))
        ]
      },
      bar: { color: '#3B82F6' },
      steps: [
        { range: [0, 100], color: '#1F2937' },
        { range: [100, 200], color: '#374151' }
      ]
    }
  }

  const indicatorsData = {
    x: stockData.map(d => d.date),
    y: stockData.map(d => (d.close - d.open) / d.open * 100),
    type: 'scatter',
    mode: 'lines',
    name: 'Daily Change %',
    line: { color: '#8B5CF6' }
  }

  // Update the chart components to use proper typing
  const ChartCard = ({ title, icon: Icon, data, layout }: { 
    title: string; 
    icon: React.ComponentType<{ className?: string }>; 
    data: any[]; 
    layout: any;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length > 0 ? (
            <Plot
              data={data}
              layout={{
                ...layout,
                autosize: true,
                margin: { l: 40, r: 40, t: 40, b: 40 },
              }}
              config={{ responsive: true }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stock Performance Analysis</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Enter stock symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {stockData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insights */}
          <AIInsights data={stockData} symbol={symbol} />

          {/* Technical Indicators */}
          <TechnicalIndicators data={stockData} symbol={symbol} />

          {/* Price Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  Price Chart - {symbol}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Plot
                    data={[candlestickData]}
                    layout={{
                      title: `${symbol} Price Chart`,
                      xaxis: { title: 'Date' },
                      yaxis: { title: 'Price' },
                      autosize: true,
                      margin: { l: 50, r: 50, t: 50, b: 50 },
                    }}
                    config={{ responsive: true }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Volume Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Volume - {symbol}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Plot
                    data={[volumeData]}
                    layout={{
                      title: `${symbol} Volume`,
                      xaxis: { title: 'Date' },
                      yaxis: { title: 'Volume' },
                      autosize: true,
                      margin: { l: 50, r: 50, t: 50, b: 50 },
                    }}
                    config={{ responsive: true }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forecast Chart */}
          {forecastData.length > 0 && (
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Price Forecast - {symbol}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <Plot
                      data={[
                        {
                          x: forecastData.map(d => d.date),
                          y: forecastData.map(d => d.yhat),
                          type: 'scatter',
                          mode: 'lines',
                          name: 'Forecast',
                          line: { color: '#3B82F6' }
                        },
                        {
                          x: forecastData.map(d => d.date),
                          y: forecastData.map(d => d.yhat_upper),
                          type: 'scatter',
                          mode: 'lines',
                          name: 'Upper Bound',
                          line: { color: '#10B981', dash: 'dash' }
                        },
                        {
                          x: forecastData.map(d => d.date),
                          y: forecastData.map(d => d.yhat_lower),
                          type: 'scatter',
                          mode: 'lines',
                          name: 'Lower Bound',
                          line: { color: '#EF4444', dash: 'dash' }
                        }
                      ]}
                      layout={{
                        title: `${symbol} Price Forecast`,
                        xaxis: { title: 'Date' },
                        yaxis: { title: 'Price' },
                        autosize: true,
                        margin: { l: 50, r: 50, t: 50, b: 50 },
                      }}
                      config={{ responsive: true }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 