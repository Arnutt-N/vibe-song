import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { MoodEmoji, MoodState } from '@/types'

interface MoodStore extends MoodState {
  // Actions
  setEmoji: (emoji: MoodEmoji | null) => void
  setEnergyLevel: (level: number) => void
  setMoodValence: (valence: number) => void
  resetMood: () => void
  setMood: (mood: Partial<MoodState>) => void
}

const initialState: MoodState = {
  emoji: null,
  energyLevel: 5,
  moodValence: 5,
}

export const useMoodStore = create<MoodStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setEmoji: (emoji) => set({ emoji }),

        setEnergyLevel: (energyLevel) => {
          // Ensure energy level is between 1-10
          const clampedLevel = Math.max(1, Math.min(10, energyLevel))
          set({ energyLevel: clampedLevel })
        },

        setMoodValence: (moodValence) => {
          // Ensure mood valence is between 1-10
          const clampedValence = Math.max(1, Math.min(10, moodValence))
          set({ moodValence: clampedValence })
        },

        setMood: (mood) => set(mood),

        resetMood: () => set(initialState),
      }),
      {
        name: 'vibe-song-mood',
      }
    ),
    {
      name: 'MoodStore',
    }
  )
)
