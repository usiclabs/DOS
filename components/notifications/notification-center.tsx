"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bell, Check, X, TrendingUp, Zap, Shield, AlertTriangle, Info, CheckCircle, XCircle, Clock } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"

const notificationIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  price: TrendingUp,
  pool: Zap,
  ai: Shield,
  transaction: Clock,
}

const notificationColors = {
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  info: "text-blue-400",
  price: "text-purple-400",
  pool: "text-black",
  ai: "text-indigo-400",
  transaction: "text-orange-400",
}

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications()
  const [filter, setFilter] = useState<string>("all")

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    return notification.type === filter
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl sm:max-w-[95vw] max-h-[90vh] w-full glass-card border-accent/20 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span className="text-sm sm:text-base">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-red-500/20 text-red-400 text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead} className="text-xs bg-transparent">
                  <Check className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Mark All Read</span>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={clearAll} className="text-xs bg-transparent">
                <X className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Clear All</span>
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            View and manage your DEUS token price alerts, pool updates, and platform notifications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="overflow-x-auto">
            <div className="flex items-center space-x-2 min-w-max pb-2">
              {[
                { id: "all", label: "All" },
                { id: "unread", label: "Unread" },
                { id: "price", label: "Price Alerts" },
                { id: "pool", label: "Pool Updates" },
                { id: "ai", label: "AI Insights" },
                { id: "transaction", label: "Transactions" },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={filter === tab.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(tab.id)}
                  className="whitespace-nowrap text-xs sm:text-sm px-3 py-1.5"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <ScrollArea className="h-80 sm:h-96">
            <div className="space-y-3 pr-2">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-sm">No notifications found</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const IconComponent = notificationIcons[notification.type]
                  const iconColor = notificationColors[notification.type]

                  return (
                    <Card
                      key={notification.id}
                      className={`glass-card cursor-pointer transition-all hover:bg-accent/5 ${
                        !notification.read ? "border-accent/40" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`mt-1 flex-shrink-0 ${iconColor}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm leading-tight break-words">{notification.title}</h4>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                </span>
                                {!notification.read && <div className="w-2 h-2 bg-accent rounded-full"></div>}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed break-words">
                              {notification.message}
                            </p>
                            {notification.action && (
                              <Button variant="outline" size="sm" className="mt-2 bg-transparent text-xs">
                                {notification.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
