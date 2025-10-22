'use client'

import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlayerStore } from '@/store'
import { cn } from '@/lib/utils'

export function PlayerControls() {
  const { currentTrack, isPlaying, queue, queueIndex, togglePlay, next, previous } =
    usePlayerStore()

  const canGoNext = queueIndex < queue.length - 1
  const canGoPrevious = queueIndex > 0 || (currentTrack && true)

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={previous}
        disabled={!canGoPrevious || !currentTrack}
        className="h-8 w-8"
        aria-label="Previous track"
      >
        <SkipBack className="h-4 w-4" />
      </Button>

      {/* Play/Pause Button */}
      <Button
        variant="default"
        size="icon"
        onClick={togglePlay}
        disabled={!currentTrack}
        className="h-10 w-10 rounded-full"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 fill-current" />
        ) : (
          <Play className="h-5 w-5 fill-current" />
        )}
      </Button>

      {/* Next Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={next}
        disabled={!canGoNext || !currentTrack}
        className="h-8 w-8"
        aria-label="Next track"
      >
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  )
}
