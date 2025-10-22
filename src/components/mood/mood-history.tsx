'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { useMoodStore } from '@/store'
import { MOOD_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { MoodEmoji, MoodSession } from '@/types'
import { formatDistanceToNow } from 'date-fns'

export function MoodHistory() {
  const [recentMoods, setRecentMoods] = useState<MoodSession[]>([])
  const { setMood } = useMoodStore()

  // TODO: Fetch from Supabase when auth is implemented
  // For now, use localStorage for persistence
  useEffect(() => {
    const stored = localStorage.getItem('vibe-song-mood-history')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setRecentMoods(parsed.slice(0, 3)) // Show last 3
      } catch (error) {
        console.error('Failed to parse mood history:', error)
      }
    }
  }, [])

  const handleSelectPreviousMood = (session: MoodSession) => {
    setMood({
      emoji: session.moodEmoji as MoodEmoji,
      energyLevel: session.energyLevel,
      moodValence: session.moodValence,
    })
  }

  if (recentMoods.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Recent moods</span>
      </div>

      <div className="flex gap-2">
        {recentMoods.map((session) => {
          const mood = MOOD_MAP[session.moodEmoji as MoodEmoji]

          return (
            <button
              key={session.id}
              onClick={() => handleSelectPreviousMood(session)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border",
                "hover:border-primary/50 hover:bg-accent/50 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
              title={`${mood.label} - ${formatDistanceToNow(new Date(session.createdAt))} ago`}
            >
              <span className="text-2xl" role="img" aria-label={mood.label}>
                {session.moodEmoji}
              </span>
              <div className="text-left">
                <div className="text-xs font-medium">{mood.label}</div>
                <div className="text-xs text-muted-foreground">
                  E:{session.energyLevel} V:{session.moodValence}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
