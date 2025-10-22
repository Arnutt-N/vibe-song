'use client'

import { usePlayerStore } from '@/store'
import { cn } from '@/lib/utils'

export function ProgressBar() {
  const { currentTime, duration, seek } = usePlayerStore()

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    seek(newTime)
  }

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Current Time */}
      <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
        {formatTime(currentTime)}
      </span>

      {/* Progress Bar */}
      <div
        className="flex-1 h-2 bg-secondary rounded-full cursor-pointer group relative"
        onClick={handleSeek}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
      >
        {/* Background Track */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {/* Progress Fill */}
          <div
            className={cn(
              "h-full bg-primary transition-all",
              "group-hover:bg-primary/80"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Hover Thumb */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "pointer-events-none"
          )}
          style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      {/* Duration */}
      <span className="text-xs text-muted-foreground tabular-nums w-10">
        {formatTime(duration)}
      </span>
    </div>
  )
}
