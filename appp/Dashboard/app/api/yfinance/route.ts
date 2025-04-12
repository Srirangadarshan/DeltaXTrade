import { NextResponse } from 'next/server'
import yfinance from 'yfinance'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const period = searchParams.get('period') || '1mo'

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  try {
    const quote = await yfinance.quote(symbol)
    const historical = await yfinance.historical(symbol, {
      period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      period2: new Date().toISOString().split('T')[0],
      interval: '1d'
    })

    // Calculate technical indicators
    const sma20 = calculateSMA(historical.map(h => h.close), 20)
    const rsi = calculateRSI(historical.map(h => h.close), 14)
    const volatility = calculateVolatility(historical.map(h => h.close))

    return NextResponse.json({
      symbol: quote.symbol,
      currentPrice: quote.regularMarketPrice,
      change24h: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      historical: historical,
      indicators: {
        sma20: sma20[sma20.length - 1],
        rsi: rsi[rsi.length - 1],
        volatility: volatility
      }
    })
  } catch (error) {
    console.error('Error fetching stock data:', error)
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 })
  }
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

function calculateVolatility(data: number[]): number {
  const returns = data.map((d, i) => i === 0 ? 0 : (d - data[i - 1]) / data[i - 1])
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length
  return Math.sqrt(variance) * Math.sqrt(252) // Annualized volatility
} 