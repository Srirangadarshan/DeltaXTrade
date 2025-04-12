"use client"

import type { StockData } from "@/types/stock"
import { TrendingUp, TrendingDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface WatchlistProps {
  stocks: StockData[]
  onSelect: (symbol: string) => void
  onRemove: (symbol: string) => void
  selectedStocks: string[]
}

export default function Watchlist({ stocks, onSelect, onRemove, selectedStocks }: WatchlistProps) {
  if (stocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-gray-200 text-lg font-medium mb-2">Your watchlist is empty</p>
        <p className="text-gray-300">Add stocks to track their performance</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[300px] pr-3">
      <div className="space-y-3">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer group
              ${selectedStocks.includes(stock.symbol) 
                ? 'bg-gray-800 border-gray-500' 
                : 'bg-gray-800/50 border-gray-600 hover:bg-gray-800'}`}
            onClick={() => onSelect(stock.symbol)}
          >
            <div>
              <div className="flex items-center">
                <h3 className="font-medium text-gray-200 text-lg">{stock.symbol}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(stock.symbol)
                  }}
                >
                  <X className="h-3 w-3 text-gray-300 hover:text-gray-200" />
                </Button>
              </div>
              <p className="text-sm text-gray-300">{stock.name}</p>
            </div>

            <div className="text-right">
              <p className="font-medium text-gray-200 text-lg">${stock.price.toFixed(2)}</p>
              <div className="flex items-center justify-end">
                {stock.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-rose-400 mr-1" />
                )}
                <p className={`text-sm ${stock.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

