"use client"

import { useState, useEffect } from "react"

interface NotificationSettings {
  priceAlerts: boolean
  poolUpdates: boolean
  aiRecommendations: boolean
  transactions: boolean
}

interface UserSettings {
  // General
  displayName: string
  currency: string
  language: string

  // Trading
  riskTolerance: number
  slippageTolerance: number
  autoApprove: boolean
  mevProtection: boolean

  // Notifications
  notifications: NotificationSettings
  emailNotifications: boolean

  // Appearance
  theme: string
  compactMode: boolean
  animations: boolean
  advancedMode: boolean

  // Privacy
  analytics: boolean
  publicPortfolio: boolean
  keepHistory: boolean
}

const defaultSettings: UserSettings = {
  // General
  displayName: "wallet",
  currency: "USD",
  language: "en",

  // Trading
  riskTolerance: 50,
  slippageTolerance: 0.5,
  autoApprove: false,
  mevProtection: true,

  // Notifications
  notifications: {
    priceAlerts: true,
    poolUpdates: true,
    aiRecommendations: true,
    transactions: true,
  },
  emailNotifications: false,

  // Appearance
  theme: "dark",
  compactMode: false,
  animations: true,
  advancedMode: false,

  // Privacy
  analytics: true,
  publicPortfolio: false,
  keepHistory: true,
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("dos-user-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error("Failed to parse saved settings:", error)
      }
    }
  }, [])

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem("dos-user-settings", JSON.stringify(updatedSettings))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.setItem("dos-user-settings", JSON.stringify(defaultSettings))
  }

  const getSetting = <K extends keyof UserSettings>(key: K): UserSettings[K] => {
    return settings[key]
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    getSetting,
  }
}
