"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Canvas3DCountdownProps {
  endDate: Date
}

export default function Canvas3DCountdown({ endDate }: Canvas3DCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const updateCountdown = () => {
      try {
        const now = new Date().getTime()
        const end = endDate.getTime()
        const difference = end - now

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          })
        }
      } catch (error) {
        console.error("[v0] Countdown error:", error)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [endDate, mounted])

  if (!mounted) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  const primaryColor = "#eb5a3c"
  const accentColor = "#daa520"

  const countdownItems = [
    { value: timeLeft.days, label: "DAYS" },
    { value: timeLeft.hours, label: "HOURS" },
    { value: timeLeft.minutes, label: "MINS" },
    { value: timeLeft.seconds, label: "SECS" },
  ]

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      {/* Animated gradient ring background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-[90%] h-[90%] rounded-full border-4"
          style={{
            borderColor: primaryColor,
            boxShadow: `0 0 20px ${primaryColor}40, inset 0 0 20px ${primaryColor}20`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>

      {/* Countdown display */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl">
        {countdownItems.map((item, index) => (
          <motion.div
            key={item.label}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className="text-5xl md:text-7xl font-bold mb-2"
              style={{
                color: primaryColor,
                textShadow: `0 0 20px ${primaryColor}80`,
              }}
              animate={{
                textShadow: [`0 0 20px ${primaryColor}80`, `0 0 30px ${primaryColor}ff`, `0 0 20px ${primaryColor}80`],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              {String(item.value).padStart(2, "0")}
            </motion.div>
            <div className="text-xs md:text-sm font-semibold tracking-wider" style={{ color: accentColor }}>
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${(i + 1) * 100}px`,
              height: `${(i + 1) * 100}px`,
              border: `1px solid ${primaryColor}`,
              opacity: 0.1,
              left: "50%",
              top: "50%",
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  )
}
