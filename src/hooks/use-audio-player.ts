'use client'

import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store'

/**
 * Hook for managing HTML5 Audio element and syncing with player store
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const {
    currentTrack,
    isPlaying,
    volume,
    setCurrentTime,
    setDuration,
    next,
    pause,
  } = usePlayerStore()

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio()

      // Set initial volume
      audioRef.current.volume = volume

      return () => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ''
        }
      }
    }
  }, [])

  // Handle track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return

    // Update audio source
    audioRef.current.src = currentTrack.preview
    audioRef.current.load()

    // Auto-play if isPlaying is true
    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error)
        pause()
      })
    }
  }, [currentTrack])

  // Handle play/pause changes
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error)
        pause()
      })
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, pause])

  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume
  }, [volume])

  // Setup audio event listeners
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current

    // Time update
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    // Duration loaded
    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    // Track ended
    const handleEnded = () => {
      next()
    }

    // Error handling
    const handleError = (e: Event) => {
      console.error('Audio error:', e)
      pause()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [setCurrentTime, setDuration, next, pause])

  return audioRef
}
