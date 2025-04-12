"use client"

import { useEffect, useRef, useMemo } from "react"
import type { StockData } from "@/types/stock"
import { createChart } from "lightweight-charts"

interface StockChartProps {
  stock: StockData
  timeframe: "1D" | "1W" | "1M" | "3M" | "1Y"
}

export default function StockChart({ stock, timeframe }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  
  // Filter data based on timeframe
  const chartData = useMemo(() => {
    if (!stock.data) return []

    const now = new Date()
    const filterDate = new Date()

    switch (timeframe) {
      case "1D":
        filterDate.setDate(now.getDate() - 1)
        break
      case "1W":
        filterDate.setDate(now.getDate() - 7)
        break
      case "1M":
        filterDate.setMonth(now.getMonth() - 1)
        break
      case "3M":
        filterDate.setMonth(now.getMonth() - 3)
        break
      case "1Y":
        filterDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return stock.data
      .filter((d) => {
        // Ensure date is valid before comparing
        const dateObj = new Date(d.date)
        return !isNaN(dateObj.getTime()) && dateObj >= filterDate
      })
      .map((d) => ({
        time: new Date(d.date).getTime() / 1000, // Convert to UNIX timestamp in seconds
        value: d.value
      }))
  }, [stock.data, timeframe])

  // Determine if stock is up or down
  const isPositive = stock.change >= 0
  const lineColor = isPositive ? "#10b981" : "#f43f5e" // emerald-500 or rose-500

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return

    // Clean up previous chart if it exists
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#E5E7EB', // Using a very light gray for better visibility
      },
      grid: {
        vertLines: { color: 'rgba(107, 114, 128, 0.3)' }, // Lighter grid lines
        horzLines: { color: 'rgba(107, 114, 128, 0.3)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 250,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#6B7280', // Lighter border
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000)
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      },
      rightPriceScale: {
        borderColor: '#6B7280', // Lighter border
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      crosshair: {
        vertLine: {
          color: '#E5E7EB',
          labelBackgroundColor: '#4B5563',
        },
        horzLine: {
          color: '#E5E7EB',
          labelBackgroundColor: '#4B5563',
        },
      },
    })

    // Add line series
    const areaSeries = chart.addLineSeries({
      color: lineColor,
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
      lastValueVisible: true,
      priceLineVisible: true,
      priceLineColor: lineColor,
      priceLineWidth: 1,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: '#ffffff',
      crosshairMarkerBackgroundColor: lineColor,
    })

    // Set data
    areaSeries.setData(chartData)

    // Fit content
    chart.timeScale().fitContent()

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)
    
    // Save chart reference for cleanup
    chartRef.current = chart

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [chartData, lineColor])

  if (chartData.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-200">No data available</div>
  }

  return (
    <div className="h-64">
      <div ref={chartContainerRef} className="h-full w-full" />
    </div>
  )
}

