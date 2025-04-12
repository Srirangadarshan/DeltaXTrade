import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

interface AIInsightsProps {
  data: {
    date: string
    close: number
  }[]
  symbol: string
}

interface TrendAnalysis {
  trend: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  support: number
  resistance: number
  prediction: string
}

export function AIInsights({ data, symbol }: AIInsightsProps) {
  const analyzeTrend = (data: AIInsightsProps['data']): TrendAnalysis => {
    if (data.length < 20) {
      return {
        trend: 'neutral',
        confidence: 0,
        support: 0,
        resistance: 0,
        prediction: 'Insufficient data for analysis'
      }
    }

    // Calculate moving averages
    const sma20 = calculateSMA(data.map(d => d.close), 20)
    const sma50 = calculateSMA(data.map(d => d.close), 50)

    // Determine trend
    const lastPrice = data[data.length - 1].close
    const lastSMA20 = sma20[sma20.length - 1]
    const lastSMA50 = sma50[sma50.length - 1]

    let trend: TrendAnalysis['trend'] = 'neutral'
    if (lastPrice > lastSMA20 && lastSMA20 > lastSMA50) {
      trend = 'bullish'
    } else if (lastPrice < lastSMA20 && lastSMA20 < lastSMA50) {
      trend = 'bearish'
    }

    // Calculate confidence
    const priceDeviation = Math.abs(lastPrice - lastSMA20) / lastSMA20
    const confidence = Math.min(priceDeviation * 100, 100)

    // Find support and resistance levels
    const prices = data.map(d => d.close)
    const support = Math.min(...prices.slice(-20))
    const resistance = Math.max(...prices.slice(-20))

    // Generate prediction
    const prediction = generatePrediction(trend, confidence, lastPrice, support, resistance)

    return {
      trend,
      confidence,
      support,
      resistance,
      prediction
    }
  }

  const analysis = analyzeTrend(data)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          AI Insights - {symbol}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {analysis.trend === 'bullish' ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : analysis.trend === 'bearish' ? (
            <TrendingDown className="h-4 w-4 text-red-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
          <span className="font-medium">
            {analysis.trend.charAt(0).toUpperCase() + analysis.trend.slice(1)} Trend
          </span>
          <span className="text-muted-foreground">
            ({analysis.confidence.toFixed(1)}% confidence)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Support Level</p>
            <p className="font-medium">${analysis.support.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Resistance Level</p>
            <p className="font-medium">${analysis.resistance.toFixed(2)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Prediction</p>
          <p className="font-medium">{analysis.prediction}</p>
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

function generatePrediction(
  trend: TrendAnalysis['trend'],
  confidence: number,
  currentPrice: number,
  support: number,
  resistance: number
): string {
  const priceToSupport = ((currentPrice - support) / support) * 100
  const priceToResistance = ((resistance - currentPrice) / currentPrice) * 100

  if (trend === 'bullish' && confidence > 70) {
    return `Strong bullish momentum. Price may test resistance at $${resistance.toFixed(2)} (${priceToResistance.toFixed(1)}% upside)`
  } else if (trend === 'bearish' && confidence > 70) {
    return `Strong bearish momentum. Price may test support at $${support.toFixed(2)} (${priceToSupport.toFixed(1)}% downside)`
  } else if (trend === 'bullish') {
    return `Moderate bullish bias. Watch for resistance at $${resistance.toFixed(2)}`
  } else if (trend === 'bearish') {
    return `Moderate bearish bias. Watch for support at $${support.toFixed(2)}`
  } else {
    return 'Neutral market conditions. Price may consolidate between support and resistance levels'
  }
} 