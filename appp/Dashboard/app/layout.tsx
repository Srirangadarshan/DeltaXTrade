import type { Metadata } from 'next'
import './globals.css'
import '../styles/custom.css'

export const metadata: Metadata = {
  title: 'ΔxTrade',
  description: 'Advanced Stock Trading Platform',
  generator: 'ΔxTrade',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
