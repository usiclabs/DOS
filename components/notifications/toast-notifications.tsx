"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/hooks/use-notifications"
import { CheckCircle, XCircle, AlertTriangle, Info, TrendingUp, Zap } from "lucide-react"

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  price: TrendingUp,
  pool: Zap,
  ai: Info,
  transaction: CheckCircle,
}

export function ToastNotifications() {
  const { toast } = useToast()
  const { notifications } = useNotifications()

  useEffect(() => {
    const recentNotifications = notifications.filter((n) => !n.read && Date.now() - n.timestamp.getTime() < 5000)

    const uniqueNotifications = recentNotifications.filter(
      (notification, index, array) => array.findIndex((n) => n.title === notification.title) === index,
    )

    uniqueNotifications.forEach((notification) => {
      const IconComponent = toastIcons[notification.type]

      toast({
        title: notification.title,
        description: notification.message,
        duration: notification.type === "price" ? 8000 : 5000,
      })
    })
  }, [notifications, toast])

  return null
}
