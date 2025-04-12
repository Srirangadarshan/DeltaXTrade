import { NextResponse } from 'next/server'
// @ts-ignore - yfinance doesn't have type definitions
import yfinance from 'yfinance'

interface StockDay {
  Date: Date
  Open: number
  High: number
  Low: number
  Close: number
  Volume: number
}

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params
    
    // Fetch stock data using yfinance
    const stock = await yfinance.Ticker(symbol)
    const history = await stock.history({ period: '1mo' }) as StockDay[]
    
    // Calculate basic statistics
    const prices = history.map((day: StockDay) => day.Close)
    const recentPrices = prices.slice(0, 10)
    const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length
    const recentAvg = recentPrices.reduce((a: number, b: number) => a + b, 0) / recentPrices.length
    
    // Calculate volatility
    const returns: number[] = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }
    const mean = returns.reduce((a: number, b: number) => a + b, 0) / returns.length
    const variance = returns.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / returns.length
    const volatility = Math.sqrt(variance) * Math.sqrt(252) // Annualized volatility
    
    // Generate insights
    const trend = recentAvg > avgPrice ? 'bullish' : 'bearish'
    const trendStrength = Math.abs((recentAvg - avgPrice) / avgPrice) * 100
    
    // Calculate support and resistance levels
    const support = Math.min(...recentPrices)
    const resistance = Math.max(...recentPrices)
    
    // Calculate next week prediction based on current trend
    const currentPrice = prices[0]
    const prediction = currentPrice * (1 + (trend === 'bullish' ? 0.02 : -0.02))
    
    const insights = {
      trend: `The stock has shown a ${trend} trend over the last 10 days with a ${trendStrength.toFixed(1)}% change.`,
      prediction: `Based on current trends, the stock is expected to reach $${prediction.toFixed(2)} in the next week.`,
      support: `$${support.toFixed(2)}`,
      resistance: `$${resistance.toFixed(2)}`,
      volatility: `${(volatility * 100).toFixed(1)}%`
    }

    return NextResponse.json(insights)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
} 