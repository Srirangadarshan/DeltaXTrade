import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Activity, TrendingUp, TrendingDown } from "lucide-react"
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface TechnicalIndicatorsProps {
  data: {
    date: string
    close: number
    volume?: number
  }[]
  symbol: string
}

export function TechnicalIndicators({ data, symbol }: TechnicalIndicatorsProps) {
  if (data.length < 20) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Technical Indicators - {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Insufficient data for technical analysis</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate indicators
  const sma20 = calculateSMA(data.map(d => d.close), 20)
  const sma50 = calculateSMA(data.map(d => d.close), 50)
  const rsi = calculateRSI(data.map(d => d.close), 14)
  const macd = calculateMACD(data.map(d => d.close))

  // Prepare chart data
  const chartData = data.slice(50).map((d, i) => ({
    date: d.date,
    price: d.close,
    sma20: sma20[i + 30],
    sma50: sma50[i],
    rsi: rsi[i + 36],
    macd: macd.macd[i + 26],
    signal: macd.signal[i + 26],
    histogram: macd.histogram[i + 26]
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-4 w-4" />
          Technical Indicators - {symbol}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Price and Moving Averages */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="price"
                stroke="#3B82F6"
                name="Price"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sma20"
                stroke="#10B981"
                name="SMA 20"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sma50"
                stroke="#8B5CF6"
                name="SMA 50"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* RSI */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="rsi"
                stroke="#F59E0B"
                name="RSI"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* MACD */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="macd"
                stroke="#3B82F6"
                name="MACD"
              />
              <Line
                type="monotone"
                dataKey="signal"
                stroke="#EF4444"
                name="Signal"
              />
              <Line
                type="monotone"
                dataKey="histogram"
                stroke="#10B981"
                name="Histogram"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* Indicator Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">RSI (14)</p>
            <div className="flex items-center gap-2">
              {chartData[chartData.length - 1].rsi > 70 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : chartData[chartData.length - 1].rsi < 30 ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <Activity className="h-4 w-4 text-yellow-500" />
              )}
              <span className="font-medium">
                {chartData[chartData.length - 1].rsi.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">MACD</p>
            <div className="flex items-center gap-2">
              {chartData[chartData.length - 1].histogram > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">
                {chartData[chartData.length - 1].macd.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Signal</p>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="font-medium">
                {chartData[chartData.length - 1].signal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = []
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    sma.push(sum / period)
  }
  return sma
}

function calculateRSI(data: number[], period: number): number[] {
  const rsi: number[] = []
  const changes = data.map((d, i) => i === 0 ? 0 : d - data[i - 1])
  
  for (let i = period; i < changes.length; i++) {
    const gains = changes.slice(i - period, i).filter(c => c > 0)
    const losses = changes.slice(i - period, i).filter(c => c < 0)
    const avgGain = gains.reduce((a, b) => a + b, 0) / period
    const avgLoss = Math.abs(losses.reduce((a, b) => a + b, 0)) / period
    const rs = avgGain / avgLoss
    rsi.push(100 - (100 / (1 + rs)))
  }
  
  return rsi
}

function calculateMACD(data: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
  const ema12 = calculateEMA(data, 12)
  const ema26 = calculateEMA(data, 26)
  
  const macd = ema12.map((value, i) => value - ema26[i])
  const signal = calculateEMA(macd, 9)
  
  const histogram = macd.map((value, i) => value - signal[i])
  
  return { macd, signal, histogram }
}

function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = []
  const multiplier = 2 / (period + 1)
  
  // Start with SMA
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i]
  }
  ema.push(sum / period)
  
  // Calculate EMA
  for (let i = period; i < data.length; i++) {
    ema.push((data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1])
  }
  
  return ema
} 