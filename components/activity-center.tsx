"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X, Sparkles, AlertCircle, CheckCircle } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface Notification {
  id: string
  type: "success" | "info" | "warning" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "robinhood-pools",
    type: "info",
    title: "Robinhood pools are live",
    message: "Review high-net-APY ETH and USDG liquidity opportunities on Robinhood Chain.",
    timestamp: new Date(Date.now() - 3600000),
    read: true,
  },
]

export function ActivityCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const unreadCount = notifications.filter((n) => !n.read).length
  const visibleNotifications = notifications.slice(0, 8)

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-primary" />
      case "info":
        return <Sparkles className="h-5 w-5 text-blue-300" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-300" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-300" />
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full border-l border-border/80 bg-background/95 backdrop-blur-2xl sm:max-w-md">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-semibold tracking-tight text-foreground">Activity Center</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-accent-foreground">
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-4">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No notifications</p>
              </motion.div>
            ) : (
              visibleNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    notification.read
                      ? "bg-white/5 border-white/10"
                      : "bg-accent/10 border-accent/30 hover:border-accent/50"
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-white/10">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-white text-sm">{notification.title}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -mt-1 -mr-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNotification(notification.id)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-400">
                        {notification.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  )
}
