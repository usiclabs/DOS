"use client"

import { useState, useEffect } from "react"

export function useFavorites(key: string) {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(`favorites_${key}`)
    if (stored) {
      setFavorites(JSON.parse(stored))
    }
  }, [key])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
      localStorage.setItem(`favorites_${key}`, JSON.stringify(newFavorites))
      return newFavorites
    })
  }

  const isFavorite = (id: string) => favorites.includes(id)

  return { favorites, toggleFavorite, isFavorite }
}
