"use client"

import { useEffect, useRef } from "react"

export default function PixelatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Initialize time variable at the top before any functions use it
    let time = 0
    let animationFrameId: number

    // Set canvas to full screen
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawBackground()
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    // Draw pixelated background
    function drawBackground() {
      const { width, height } = canvas

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Pixel size
      const pixelSize = 20
      const cols = Math.ceil(width / pixelSize)
      const rows = Math.ceil(height / pixelSize)

      // Draw pixels
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          // Calculate pixel position
          const x = i * pixelSize
          const y = j * pixelSize

          // Calculate noise value based on position and time
          const noise = simplex(i * 0.05, j * 0.05, time * 0.1)

          // Map noise to color
          const hue = 160 + noise * 40 // Green-blue range
          const saturation = 70 + noise * 30
          const lightness = Math.max(5, 15 + noise * 10)

          // Only draw if noise is above threshold (creates sparse effect)
          if (noise > -0.3) {
            ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.1 + noise * 0.3})`
            ctx.fillRect(x, y, pixelSize - 1, pixelSize - 1)
          }
        }
      }
    }

    // Simple animation loop
    function animate() {
      time += 0.01
      drawBackground()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Simple 3D simplex noise function (simplified for this example)
  function simplex(x: number, y: number, z: number): number {
    // This is a very simplified version of simplex noise
    // In a real app, you'd use a proper noise library
    return Math.sin(x + z) * Math.cos(y + z * 0.5) * 0.5
  }

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" style={{ filter: "blur(1px)" }} />
}

