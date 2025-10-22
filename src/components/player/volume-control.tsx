'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { usePlayerStore } from '@/store'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function VolumeControl() {
  const { volume, setVolume } = usePlayerStore()
  const [lastVolume, setLastVolume] = useState(0.7)

  const isMuted = volume === 0

  const toggleMute = () => {
    if (isMuted) {
      setVolume(lastVolume)
    } else {
      setLastVolume(volume)
      setVolume(0)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (newVolume > 0) {
      setLastVolume(newVolume)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Mute/Unmute Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="h-8 w-8"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>

      {/* Volume Slider */}
      <div className="w-24 hidden sm:block">
        <Slider
          value={[volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="cursor-pointer"
          aria-label="Volume"
        />
      </div>

      {/* Volume Percentage (optional, for debugging) */}
      {/* <span className="text-xs text-muted-foreground w-8">
        {Math.round(volume * 100)}
      </span> */}
    </div>
  )
}
