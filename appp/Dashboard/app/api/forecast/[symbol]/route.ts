import { NextResponse } from 'next/server'

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}&outputsize=full`
    )
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch forecast data' }, { status: 500 })
  }
}

function generateMockForecast(data: { ds: string; y: number }[]) {
  const lastDate = new Date(data[data.length - 1].ds)
  const forecast = []
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(lastDate)
    date.setDate(date.getDate() + i)
    
    const lastPrice = data[data.length - 1].y
    const randomChange = (Math.random() - 0.5) * 0.02 // Random change between -1% and +1%
    const predictedPrice = lastPrice * (1 + randomChange)
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      yhat: predictedPrice,
      yhat_lower: predictedPrice * 0.98,
      yhat_upper: predictedPrice * 1.02
    })
  }
  
  return forecast
} 