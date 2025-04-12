"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface MenuItem {
  id: string
  label: string
  icon?: ReactNode
}

interface GlowingMenuProps {
  items: MenuItem[]
  activeItem: string
  onItemClick: (id: string) => void
}

export default function GlowingMenu({ items, activeItem, onItemClick }: GlowingMenuProps) {
  return (
    <div className="relative">
      <div className="flex items-center space-x-1 bg-gray-900/50 backdrop-blur-md rounded-full p-1 border border-gray-800">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              activeItem === item.id ? "text-white" : "text-white hover:text-gray-200"
            }`}
          >
            <span className="flex items-center space-x-2">
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </span>

            {activeItem === item.id && (
              <motion.div
                layoutId="glowingBg"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-600/80 to-blue-600/80 -z-10"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}

            {/* Glow effect */}
            {activeItem === item.id && (
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md -z-20" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

