"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  BarChart3,
  LineChart,
  TrendingUp,
  Search,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListFilter,
  Star,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { StockData } from "@/types/stock"
import StockChart from "@/components/stock-chart"
import Watchlist from "@/components/watchlist"
import PixelatedBackground from "@/components/pixelated-background"
import GlowingMenu from "@/components/glowing-menu"
import StockTable from "@/components/stock-table"

export default function Dashboard() {
  const router = useRouter()
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
  const [watchlist, setWatchlist] = useState<StockData[]>([])
  const [stocks, setStocks] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1M")
  const [filteredStocks, setFilteredStocks] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("dashboard")
  const itemsPerPage = 15
  const [selectedStocks, setSelectedStocks] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    sector: "all"
  })

  const sectors = ["Technology", "Finance", "Healthcare", "Energy", "Consumer", "Industrial", "All"]

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:3001/api/stocks')
        if (!response.ok) {
          throw new Error('Failed to fetch stocks')
        }
        const stockSymbols = await response.json()
        setStocks(stockSymbols)
        setFilteredStocks(stockSymbols)
        setLoading(false)
      } catch (err) {
        setError("Failed to load stocks")
        setLoading(false)
        console.error("Error loading stocks:", err)
      }
    }

    fetchStocks()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = stocks.filter((stock) => stock.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredStocks(filtered)
      setCurrentPage(1)
    } else {
      setFilteredStocks(stocks)
    }
  }, [searchTerm, stocks])

  const handleSearch = async (symbol: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`http://localhost:3001/api/stocks/${symbol}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        setLoading(false)
        if (errorData && errorData.error) {
          setError(`Error: ${errorData.error}. Please check if the stock symbol exists.`)
        } else {
          setError(`Failed to fetch stock data (${response.status}). Please try again.`)
        }
        return
      }
      const stockData = await response.json()
      setSelectedStock(stockData)
      setSelectedStocks(prev => [...prev, symbol])
      setLoading(false)
    } catch (err) {
      setError("Failed to load stock data. Please check if the server is running and try again.")
      setLoading(false)
      console.error("Error loading stock data:", err)
    }
  }

  const handleAddToWatchlist = (stock: StockData) => {
    if (!watchlist.find((s) => s.symbol === stock.symbol)) {
      setWatchlist([...watchlist, stock])
    }
  }

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter((s) => s.symbol !== symbol))
    setSelectedStocks(prev => prev.filter(s => s !== symbol))
  }

  const paginatedStocks = filteredStocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage)

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
    if (tab === "task-performance") {
      router.push("/task-performance")
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <PixelatedBackground />

      <div className="relative z-10">
        {/* Top Navigation */}
        <header className="border-b border-gray-800 backdrop-blur-md bg-black/40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
                  ΔxTrade
                </h1>
              </div>

              <GlowingMenu
                activeItem={activeTab}
                onItemClick={handleTabClick}
                items={[
                  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
                  { id: "stocks", label: "Stocks", icon: <BarChart3 className="h-4 w-4" /> },
                  { id: "watchlist", label: "Watchlist", icon: <Star className="h-4 w-4" /> },
                  { id: "insights", label: "Insights", icon: <LineChart className="h-4 w-4" /> },
                  { id: "task-performance", label: "Task Performance", icon: <Activity className="h-4 w-4" /> },
                  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
                ]}
              />

              <div className="flex items-center space-x-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px]">
                          3
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notifications</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Avatar className="cursor-pointer" onClick={() => router.push('/profile')}>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="dashboard" className="mt-0">
              {/* Dashboard Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="col-span-2"
                >
                  <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-blue-500">Market Overview</h2>
                        </div>
                        <div className="flex space-x-2">
                          {["1D", "1W", "1M", "3M", "1Y"].map((tf) => (
                            <Button
                              key={tf}
                              onClick={() => setTimeframe(tf as any)}
                              variant={timeframe === tf ? "default" : "outline"}
                              size="sm"
                              className={timeframe === tf ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                            >
                              {tf}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {error ? (
                        <div className="flex flex-col items-center justify-center h-64">
                          <LineChart className="h-16 w-16 text-red-600 mb-4" />
                          <p className="text-red-400">{error}</p>
                          <Button 
                            onClick={() => setError(null)} 
                            variant="outline" 
                            className="mt-4"
                          >
                            Dismiss
                          </Button>
                        </div>
                      ) : selectedStock ? (
                        <StockChart stock={selectedStock} timeframe={timeframe} />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64">
                          <LineChart className="h-16 w-16 text-gray-600 mb-4" />
                          <p className="text-gray-400">Select a stock to view chart</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm h-full">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4">Watchlist</h2>
                      <Watchlist 
                        stocks={watchlist} 
                        onSelect={handleSearch} 
                        onRemove={handleRemoveFromWatchlist}
                        selectedStocks={selectedStocks} 
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-xl font-bold">Stock Explorer</h2>
                        <p className="text-gray-400 text-sm">Browse and search stocks</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Search stocks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-gray-800 border-gray-700 w-[200px] focus:ring-emerald-500"
                          />
                        </div>
                        <div className="relative">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setShowFilters(!showFilters)}
                            className={showFilters ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                          >
                            <ListFilter className="h-4 w-4" />
                          </Button>
                          {showFilters && (
                            <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-4 z-50">
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-1">Sector</label>
                                  <select
                                    value={filters.sector}
                                    onChange={(e) => handleFilterChange("sector", e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                  >
                                    {sectors.map(sector => (
                                      <option key={sector} value={sector.toLowerCase()}>{sector}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <StockTable 
                      stocks={paginatedStocks} 
                      onSelect={handleSearch} 
                      loading={loading} 
                      onAddToWatchlist={handleAddToWatchlist}
                      watchlist={watchlist}
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-gray-400">
                          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(currentPage * itemsPerPage, filteredStocks.length)} of {filteredStocks.length}{" "}
                          stocks
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="stocks">
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">Stocks view content would go here</p>
              </div>
            </TabsContent>

            <TabsContent value="watchlist">
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">Watchlist view content would go here</p>
              </div>
            </TabsContent>

            <TabsContent value="insights">
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">Insights view content would go here</p>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">Settings view content would go here</p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

const handleClearWatchlist = () => {
    setWatchlist([])
  }

