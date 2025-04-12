import type React from "react"

interface ChartProps {
  data: any[]
  children: React.ReactNode
}

export const Chart = ({ data, children }: ChartProps) => {
  return <>{children}</>
}

export const ChartContainer = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

interface ChartTooltipProps {
  children: (props: { activePoint: any }) => React.ReactNode
}

export const ChartTooltip = ({ children }: ChartTooltipProps) => {
  // Mock activePoint for demonstration purposes
  const activePoint = null

  return <>{children({ activePoint })}</>
}

export const ChartTooltipContent = ({
  title,
  content,
  className,
}: { title: string; content: string; className?: string }) => {
  return (
    <div className={className}>
      <div className="font-semibold">{title}</div>
      <div>{content}</div>
    </div>
  )
}

interface LineProps {
  dataKey: string
  stroke: string
}

export const Line = ({ dataKey, stroke }: LineProps) => {
  return null
}

interface LinearGradientProps {
  id: string
  from: string
  to: string
  fromOpacity?: number
  toOpacity?: number
}

export const LinearGradient = ({ id, from, to, fromOpacity, toOpacity }: LinearGradientProps) => {
  return null
}

interface AreaProps {
  dataKey: string
  fill: string
  stroke: string
  strokeWidth?: number
}

export const Area = ({ dataKey, fill, stroke, strokeWidth }: AreaProps) => {
  return null
}

export const AreaChart = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

interface XAxisProps {
  tickCount?: number
  tickFormatter?: (value: string | number) => string
  stroke?: string
  tickStroke?: string
}

export const XAxis = ({ tickCount, tickFormatter, stroke, tickStroke }: XAxisProps) => {
  return null
}

interface YAxisProps {
  tickCount?: number
  tickFormatter?: (value: number) => string
  stroke?: string
  tickStroke?: string
}

export const YAxis = ({ tickCount, tickFormatter, stroke, tickStroke }: YAxisProps) => {
  return null
}

interface GridProps {
  vertical?: boolean
  strokeDasharray?: string
}

export const Grid = ({ vertical, strokeDasharray }: GridProps) => {
  return null
}

