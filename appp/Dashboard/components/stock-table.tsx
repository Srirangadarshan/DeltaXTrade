"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Star } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { StockData } from "@/types/stock"

interface StockTableProps {
  stocks: string[]
  onSelect: (symbol: string) => void
  loading: boolean
  onAddToWatchlist: (stock: StockData) => void
  watchlist: StockData[]
}

export default function StockTable({ stocks, onSelect, loading, onAddToWatchlist, watchlist }: StockTableProps) {
  const [stockDataMap, setStockDataMap] = useState<Record<string, StockData>>({})

  useEffect(() => {
    const fetchStockData = async () => {
      const newStockDataMap: Record<string, StockData> = {}
      
      for (const symbol of stocks) {
        try {
          const response = await fetch(`http://localhost:3001/api/stocks/${symbol}`)
          if (response.ok) {
            const data = await response.json()
            newStockDataMap[symbol] = data
          }
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error)
        }
      }
      
      setStockDataMap(newStockDataMap)
    }

    fetchStockData()
  }, [stocks])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (stocks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No stocks found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800">
            <TableHead className="text-gray-400">Symbol</TableHead>
            <TableHead className="text-gray-400">Price</TableHead>
            <TableHead className="text-gray-400">Close</TableHead>
            <TableHead className="text-gray-400">High</TableHead>
            <TableHead className="text-gray-400">Low</TableHead>
            <TableHead className="text-gray-400">Volume</TableHead>
            <TableHead className="text-gray-400">Change</TableHead>
            <TableHead className="text-gray-400">Watchlist</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((symbol) => {
            const stockData = stockDataMap[symbol] || {
              symbol,
              name: symbol,
              price: 0,
              close: 0,
              high: 0,
              low: 0,
              open: 0,
              volume: 0,
              change: 0,
              changePercent: 0
            }

            const isInWatchlist = watchlist.some((stock) => stock.symbol === symbol)
            const isPositive = stockData.change >= 0

            return (
              <TableRow
                key={symbol}
                className="border-gray-800 hover:bg-gray-800/50"
              >
                <TableCell className="cursor-pointer text-white font-bold tracking-wider text-lg" onClick={() => onSelect(symbol)}>{symbol}</TableCell>
                <TableCell className="cursor-pointer text-white" onClick={() => onSelect(symbol)}>${stockData.price.toFixed(2)}</TableCell>
                <TableCell className="cursor-pointer text-white" onClick={() => onSelect(symbol)}>${stockData.close.toFixed(2)}</TableCell>
                <TableCell className="cursor-pointer text-white" onClick={() => onSelect(symbol)}>${stockData.high.toFixed(2)}</TableCell>
                <TableCell className="cursor-pointer text-white" onClick={() => onSelect(symbol)}>${stockData.low.toFixed(2)}</TableCell>
                <TableCell className="cursor-pointer text-white" onClick={() => onSelect(symbol)}>{stockData.volume.toLocaleString()}</TableCell>
                <TableCell className="cursor-pointer" onClick={() => onSelect(symbol)}>
                  <div className="flex items-center">
                    {stockData.changePercent >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-500 mr-1" />
                    )}
                    <span className={stockData.changePercent >= 0 ? "text-emerald-500" : "text-rose-500"}>
                      {stockData.changePercent >= 0 ? "+" : ""}{stockData.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant={isInWatchlist ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => onAddToWatchlist(stockData)}
                    className={isInWatchlist ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    {isInWatchlist ? "Added" : "Add"}
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

