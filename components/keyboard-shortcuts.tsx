"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

const shortcuts = [
  { keys: ["⌘", "K"], description: "Open command palette", action: "search" },
  { keys: ["G", "H"], description: "Go to Home", path: "/" },
  { keys: ["G", "P"], description: "Go to Pools", path: "/pools" },
  { keys: ["G", "T"], description: "Go to Treasury", path: "/treasury" },
  { keys: ["G", "A"], description: "Go to Analytics", path: "/analytics" },
  { keys: ["G", "S"], description: "Go to Swap", path: "/swap" },
  { keys: ["?"], description: "Show keyboard shortcuts", action: "help" },
  { keys: ["ESC"], description: "Close dialogs", action: "close" },
]

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts dialog
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setIsOpen(true)
        return
      }

      // Navigation shortcuts (G + key)
      if (e.key === "g" || e.key === "G") {
        const nextKey = new Promise<string>((resolve) => {
          const handler = (e: KeyboardEvent) => {
            window.removeEventListener("keydown", handler)
            resolve(e.key.toLowerCase())
          }
          window.addEventListener("keydown", handler)
          setTimeout(() => {
            window.removeEventListener("keydown", handler)
            resolve("")
          }, 1000)
        })

        nextKey.then((key) => {
          switch (key) {
            case "h":
              router.push("/")
              break
            case "p":
              router.push("/pools")
              break
            case "t":
              router.push("/treasury")
              break
            case "a":
              router.push("/analytics")
              break
            case "s":
              router.push("/swap")
              break
          }
        })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, j) => (
                  <Badge key={j} variant="outline" className="font-mono">
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
