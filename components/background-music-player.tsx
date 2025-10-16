"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export function BackgroundMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    if (value[0] > 0) {
      setIsMuted(false)
    }
  }

  return (
    <div
      className="fixed bottom-24 left-6 z-50 flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-sm border border-white/10 p-2 shadow-lg transition-all duration-300"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <audio ref={audioRef} loop preload="auto" src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/YE%20%2C%20Travis%20Scott%20%26%20Big%20Sean%20-%20SYBAU%20%28AI%29%20-bK4895dEqyczvtQKhKjrVFf7NzbbIh.mp3" />

      <Button variant="ghost" size="icon" onClick={togglePlay} className="h-10 w-10 rounded-full hover:bg-white/10">
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>

      <div
        className={`flex items-center gap-2 transition-all duration-300 ${
          showControls ? "w-32 opacity-100" : "w-0 opacity-0"
        } overflow-hidden`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="h-8 w-8 rounded-full hover:bg-white/10 flex-shrink-0"
        >
          {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        <Slider
          value={[isMuted ? 0 : volume]}
          onValueChange={handleVolumeChange}
          max={1}
          step={0.01}
          className="w-20"
        />
      </div>

      {!showControls && <div className="text-xs text-muted-foreground px-2">SYBAU</div>}
    </div>
  )
}
