import { NextResponse } from 'next/server'
import fetch from 'node-fetch'

interface StockDay {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbolParam = params.symbol

    // Yahoo Finance API URL
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbolParam}?interval=1d&range=1mo`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch stock data: ${response.statusText}`)
      return NextResponse.json(
        { error: `Failed to fetch stock data for ${symbolParam}: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Check if we have valid data
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      console.error(`No data found for symbol ${symbolParam}`, data)
      return NextResponse.json(
        { error: `No data found for symbol ${symbolParam}` },
        { status: 404 }
      )
    }

    const result = data.chart.result[0]
    
    // Check if we have timestamp and quote data
    if (!result.timestamp || !result.indicators || !result.indicators.quote || !result.indicators.quote[0]) {
      console.error(`Incomplete data found for symbol ${symbolParam}`, result)
      return NextResponse.json(
        { error: `Incomplete data found for symbol ${symbolParam}` },
        { status: 500 }
      )
    }
    
    const timestamps = result.timestamp
    const quote = result.indicators.quote[0]
    
    // Transform data into our format
    const formattedData: StockDay[] = []
    
    for (let i = 0; i < timestamps.length; i++) {
      // Skip any null or undefined values
      if (quote.open[i] === null || quote.high[i] === null || quote.low[i] === null || quote.close[i] === null) {
        continue;
      }
      
      formattedData.push({
        date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        volume: quote.volume[i] || 0
      })
    }

    // Sort by date in ascending order (oldest first)
    formattedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Check if we have enough data
    if (formattedData.length < 2) {
      console.error(`Not enough data points for symbol ${symbolParam}`, formattedData)
      return NextResponse.json(
        { error: `Not enough data points for symbol ${symbolParam}` },
        { status: 500 }
      )
    }

    // Get the latest data point
    const latest = formattedData[formattedData.length - 1]
    const previous = formattedData[formattedData.length - 2]

    // Calculate 24h change
    const change24h = ((latest.close - previous.close) / previous.close) * 100

    // Calculate technical indicators
    const closes = formattedData.map(d => d.close)
    const sma20 = calculateSMA(closes, 20)
    const rsi = calculateRSI(closes, 14)
    const volatility = calculateVolatility(closes)

    return NextResponse.json({
      currentPrice: latest.close,
      change24h,
      volume: latest.volume,
      sma20,
      rsi,
      volatility,
      data: formattedData
    })
  } catch (error) {
    console.error('Error fetching stock data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stock data' },
      { status: 500 }
    )
  }
}

function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return 0
  const sum = data.slice(0, period).reduce((a: number, b: number) => a + b, 0)
  return sum / period
}

function calculateRSI(data: number[], period: number): number {
  if (data.length < period + 1) return 0
  
  let gains = 0
  let losses = 0
  
  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1]
    if (change >= 0) {
      gains += change
    } else {
      losses -= change
    }
  }
  
  const avgGain = gains / period
  const avgLoss = losses / period
  
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

function calculateVolatility(data: number[]): number {
  if (data.length < 2) return 0
  
  const returns: number[] = []
  for (let i = 1; i < data.length; i++) {
    returns.push((data[i] - data[i - 1]) / data[i - 1])
  }
  
  const mean = returns.reduce((a: number, b: number) => a + b, 0) / returns.length
  const variance = returns.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / returns.length
  return Math.sqrt(variance) * Math.sqrt(252) // Annualized volatility
} 