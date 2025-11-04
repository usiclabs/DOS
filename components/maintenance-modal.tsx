"use client"

import type React from "react"

import { AlertTriangle, Lock, Unlock } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function MaintenanceModal() {
  const isMaintenanceMode = false

  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPasswordInput, setShowPasswordInput] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    const unlocked = localStorage.getItem("maintenance_unlocked")
    if (unlocked === "true") {
      setIsUnlocked(true)
    }
  }, [])

  // Handle password submission
  const handleUnlock = () => {
    if (password === "334455") {
      setIsUnlocked(true)
      localStorage.setItem("maintenance_unlocked", "true")
      setError("")
    } else {
      setError("Invalid password")
      setPassword("")
    }
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUnlock()
    }
  }

  if (!isMaintenanceMode || isUnlocked) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="glass-card p-8 text-center space-y-6 animate-scale-in">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse-glow rounded-full" />
              <div className="relative bg-primary/20 p-4 rounded-full border border-primary/40">
                <AlertTriangle className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold neon-text">Offline for Updates</h2>
            <p className="text-muted-foreground text-lg">D.O.S. is currently undergoing maintenance</p>
          </div>

          {/* Message */}
          <div className="space-y-3 text-foreground/80">
            <p>We're making improvements to bring you a better experience. The platform will be back online shortly.</p>
            <p className="text-sm text-muted-foreground">Thank you for your patience.</p>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="relative">
              <div className="w-2 h-2 bg-primary rounded-full animate-live-pulse" />
              <div className="absolute inset-0 w-2 h-2 bg-primary rounded-full animate-ripple" />
            </div>
            <span className="text-muted-foreground">System maintenance in progress</span>
          </div>

          {!showPasswordInput ? (
            <button
              onClick={() => setShowPasswordInput(true)}
              className="mx-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Admin Access</span>
            </button>
          ) : (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Enter admin password</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Password"
                  className="bg-background/50 border-primary/20 focus:border-primary"
                  autoFocus
                />
                <Button onClick={handleUnlock} className="bg-primary/20 hover:bg-primary/30 border border-primary/40">
                  Unlock
                </Button>
              </div>
              {error && <p className="text-xs text-red-500 animate-shake">{error}</p>}
            </div>
          )}

          {/* DEUS branding */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-primary">DEUS</span> Operating System
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
