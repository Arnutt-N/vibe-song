import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { DeezerTrack, PlayerState } from '@/types'

interface PlayerStore extends PlayerState {
  // Actions
  play: (track?: DeezerTrack) => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  addToQueue: (tracks: DeezerTrack[]) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  setQueue: (tracks: DeezerTrack[]) => void
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  queue: [],
  queueIndex: 0,
}

export const usePlayerStore = create<PlayerStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      play: (track) => {
        if (track) {
          // If a specific track is provided, play it
          const state = get()
          const trackIndex = state.queue.findIndex(t => t.id === track.id)

          if (trackIndex !== -1) {
            // Track is in queue, update index
            set({ currentTrack: track, isPlaying: true, queueIndex: trackIndex, currentTime: 0 })
          } else {
            // Track not in queue, add it and play
            set({
              currentTrack: track,
              isPlaying: true,
              queue: [...state.queue, track],
              queueIndex: state.queue.length,
              currentTime: 0,
            })
          }
        } else {
          // Resume current track
          set({ isPlaying: true })
        }
      },

      pause: () => set({ isPlaying: false }),

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      next: () => {
        const { queue, queueIndex } = get()
        if (queueIndex < queue.length - 1) {
          const nextIndex = queueIndex + 1
          set({
            currentTrack: queue[nextIndex],
            queueIndex: nextIndex,
            isPlaying: true,
            currentTime: 0,
          })
        }
      },

      previous: () => {
        const { queue, queueIndex, currentTime } = get()

        // If current time > 3 seconds, restart current track
        if (currentTime > 3) {
          set({ currentTime: 0 })
        } else if (queueIndex > 0) {
          // Otherwise go to previous track
          const prevIndex = queueIndex - 1
          set({
            currentTrack: queue[prevIndex],
            queueIndex: prevIndex,
            isPlaying: true,
            currentTime: 0,
          })
        }
      },

      seek: (time) => {
        const { duration } = get()
        const clampedTime = Math.max(0, Math.min(duration, time))
        set({ currentTime: clampedTime })
      },

      setVolume: (volume) => {
        const clampedVolume = Math.max(0, Math.min(1, volume))
        set({ volume: clampedVolume })
      },

      setCurrentTime: (currentTime) => set({ currentTime }),

      setDuration: (duration) => set({ duration }),

      addToQueue: (tracks) => {
        const { queue } = get()
        set({ queue: [...queue, ...tracks] })
      },

      removeFromQueue: (index) => {
        const { queue, queueIndex, currentTrack } = get()
        const newQueue = queue.filter((_, i) => i !== index)

        // Adjust current index if needed
        let newIndex = queueIndex
        if (index < queueIndex) {
          newIndex = queueIndex - 1
        } else if (index === queueIndex) {
          // Removed current track, play next if available
          if (newQueue.length > 0) {
            const nextTrack = newQueue[Math.min(newIndex, newQueue.length - 1)]
            set({
              queue: newQueue,
              queueIndex: Math.min(newIndex, newQueue.length - 1),
              currentTrack: nextTrack,
              currentTime: 0,
            })
            return
          } else {
            // Queue is empty
            set({
              queue: newQueue,
              queueIndex: 0,
              currentTrack: null,
              currentTime: 0,
              isPlaying: false,
            })
            return
          }
        }

        set({ queue: newQueue, queueIndex: newIndex })
      },

      clearQueue: () => set({
        queue: [],
        queueIndex: 0,
        currentTrack: null,
        isPlaying: false,
        currentTime: 0,
      }),

      setQueue: (tracks) => set({
        queue: tracks,
        queueIndex: 0,
        currentTrack: tracks[0] || null,
      }),
    }),
    {
      name: 'PlayerStore',
    }
  )
)
