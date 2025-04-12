export interface StockData {
  symbol: string
  name: string
  price: number
  close: number
  high: number
  low: number
  open: number
  volume: number
  change: number
  changePercent: number
  data?: {
    date: string
    value: number
  }[]
}

