'use client'

import { useEffect } from 'react'
import { usePlayerStore } from '@/store'

/**
 * Hook for handling keyboard shortcuts for audio player
 */
export function useKeyboardShortcuts() {
  const { isPlaying, togglePlay, next, previous, volume, setVolume } = usePlayerStore()

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      switch (event.key.toLowerCase()) {
        case ' ': // Space - Play/Pause
          event.preventDefault()
          togglePlay()
          break

        case 'arrowright': // Right Arrow - Next track
          event.preventDefault()
          next()
          break

        case 'arrowleft': // Left Arrow - Previous track
          event.preventDefault()
          previous()
          break

        case 'arrowup': // Up Arrow - Volume up
          event.preventDefault()
          setVolume(Math.min(1, volume + 0.1))
          break

        case 'arrowdown': // Down Arrow - Volume down
          event.preventDefault()
          setVolume(Math.max(0, volume - 0.1))
          break

        case 'm': // M - Mute/Unmute
          event.preventDefault()
          setVolume(volume > 0 ? 0 : 0.7)
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isPlaying, togglePlay, next, previous, volume, setVolume])
}
