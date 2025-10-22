'use client'

import { useMoodStore } from '@/store'
import { MOOD_MAP, MOOD_EMOJIS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { MoodEmoji } from '@/types'

export function EmojiSelector() {
  const { emoji, setEmoji } = useMoodStore()

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-1">How are you feeling?</h3>
        <p className="text-sm text-muted-foreground">Select your current mood</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {MOOD_EMOJIS.map((moodEmoji) => {
          const mood = MOOD_MAP[moodEmoji]
          const isSelected = emoji === moodEmoji

          return (
            <button
              key={moodEmoji}
              onClick={() => setEmoji(moodEmoji)}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
                "hover:border-primary/50 hover:bg-accent/50",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary/10 shadow-md scale-105"
                  : "border-border bg-card"
              )}
              aria-label={`Select ${mood.label} mood`}
              aria-pressed={isSelected}
            >
              <span className="text-4xl mb-2" role="img" aria-label={mood.label}>
                {moodEmoji}
              </span>
              <span className={cn(
                "text-xs font-medium",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                {mood.label}
              </span>
            </button>
          )
        })}
      </div>

      {emoji && (
        <div className="text-center p-3 bg-accent/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {MOOD_MAP[emoji].description}
          </p>
        </div>
      )}
    </div>
  )
}
