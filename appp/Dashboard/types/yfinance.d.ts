declare module 'yfinance' {
  interface HistoryOptions {
    period?: string
    interval?: string
    start?: string
    end?: string
  }

  interface HistoryData {
    empty: boolean
    toJSON: () => any[]
  }

  interface Ticker {
    history: (options?: HistoryOptions) => Promise<HistoryData>
  }

  export default function(symbol: string): Ticker
} 