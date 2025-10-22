# Technical Plan: Audio Player

## Document Information
- **Specification**: [audio-player.md](../../openspec/changes/audio-player.md)
- **Created**: 2025-10-21
- **Status**: Ready for Implementation
- **Version**: 1.0

---

## Architecture Overview

Persistent audio player component using HTML5 Audio API, Zustand for state management, and React hooks for playback control.

```
User Click Track
    ↓
usePlayerStore (Zustand)
    ↓
<audio> Element (HTML5)
    ↓
Event Handlers (timeupdate, ended, error)
    ↓
Update Store State
    ↓
UI Re-renders
```

---

## Components Structure

### 1. Audio Player Container

**Location**: `components/player/audio-player.tsx`

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/stores/player-store'
import { PlayerBar } from './player-bar'
import { useListeningHistory } from '@/hooks/use-listening-history'

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    setCurrentTime,
    setDuration,
    next,
    saveToHistory
  } = usePlayerStore()

  // Setup audio element event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      // Save to history
      saveToHistory(currentTrack)
      // Auto-advance
      next()
    }

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e)
      // Skip to next on error
      next()
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
  }, [currentTrack])

  // Control playback
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(console.error)
    } else {
      audio.pause()
    }
  }, [isPlaying])

  // Control volume
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = isMuted ? 0 : volume / 100
  }, [volume, isMuted])

  // Load new track
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    audio.src = currentTrack.preview
    audio.load()

    if (isPlaying) {
      audio.play().catch(console.error)
    }
  }, [currentTrack?.id])

  if (!currentTrack) return null

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="auto" />

      {/* Player UI */}
      <PlayerBar />
    </>
  )
}
```

---

### 2. Player Bar Component

**Location**: `components/player/player-bar.tsx`

```typescript
'use client'

import { usePlayerStore } from '@/stores/player-store'
import { NowPlaying } from './now-playing'
import { PlaybackControls } from './playback-controls'
import { ProgressBar } from './progress-bar'
import { VolumeControl } from './volume-control'

export function PlayerBar() {
  const { currentTrack } = usePlayerStore()

  if (!currentTrack) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* Left: Now Playing */}
          <NowPlaying />

          {/* Center: Playback Controls */}
          <div className="flex flex-col items-center gap-2">
            <PlaybackControls />
            <ProgressBar />
          </div>

          {/* Right: Volume */}
          <div className="flex justify-end">
            <VolumeControl />
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### 3. Playback Controls

**Location**: `components/player/playback-controls.tsx`

```typescript
'use client'

import { usePlayerStore } from '@/stores/player-store'
import { Button } from '@/components/ui/button'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

export function PlaybackControls() {
  const { isPlaying, togglePlay, previous, next, canGoPrevious, canGoNext } =
    usePlayerStore()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={previous}
        disabled={!canGoPrevious}
        aria-label="Previous track"
      >
        <SkipBack className="h-5 w-5" />
      </Button>

      <Button
        variant="default"
        size="icon"
        className="h-10 w-10"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={next}
        disabled={!canGoNext}
        aria-label="Next track"
      >
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>
  )
}
```

---

### 4. Progress Bar

**Location**: `components/player/progress-bar.tsx`

```typescript
'use client'

import { usePlayerStore } from '@/stores/player-store'
import { Slider } from '@/components/ui/slider'
import { formatTime } from '@/lib/utils'

export function ProgressBar() {
  const { currentTime, duration, seek } = usePlayerStore()

  const handleSeek = ([value]: number[]) => {
    seek(value)
  }

  return (
    <div className="flex items-center gap-2 w-full max-w-md">
      <span className="text-xs text-muted-foreground tabular-nums">
        {formatTime(currentTime)}
      </span>

      <Slider
        value={[currentTime]}
        max={duration || 30}
        step={0.1}
        onValueChange={handleSeek}
        className="w-full"
        aria-label="Seek"
      />

      <span className="text-xs text-muted-foreground tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  )
}

// lib/utils.ts
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
```

---

### 5. Volume Control

**Location**: `components/player/volume-control.tsx`

```typescript
'use client'

import { useState } from 'react'
import { usePlayerStore } from '@/stores/player-store'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Volume2, VolumeX } from 'lucide-react'

export function VolumeControl() {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="px-2">
            {volume}%
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-32" side="top">
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={([v]) => setVolume(v)}
            orientation="vertical"
            className="h-24"
            aria-label="Volume"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

---

### 6. Now Playing Display

**Location**: `components/player/now-playing.tsx`

```typescript
'use client'

import Image from 'next/image'
import { usePlayerStore } from '@/stores/player-store'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSaveTrack } from '@/hooks/use-save-track'

export function NowPlaying() {
  const { currentTrack } = usePlayerStore()
  const { isSaved, toggle } = useSaveTrack(currentTrack?.id)

  if (!currentTrack) return null

  return (
    <div className="flex items-center gap-3">
      <Image
        src={currentTrack.album.cover_medium}
        alt={currentTrack.title}
        width={56}
        height={56}
        className="rounded"
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{currentTrack.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {currentTrack.artist.name}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={isSaved ? 'Remove from saved' : 'Save track'}
      >
        <Heart
          className={`h-5 w-5 ${isSaved ? 'fill-current text-red-500' : ''}`}
        />
      </Button>
    </div>
  )
}
```

---

## State Management

### Zustand Store

**Location**: `stores/player-store.ts`

```typescript
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { DeezerTrack } from '@/types'

interface PlayerState {
  // Current playback
  currentTrack: DeezerTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean

  // Queue
  queue: DeezerTrack[]
  queueIndex: number

  // Settings
  autoAdvance: boolean
  repeat: 'none' | 'one' | 'all'

  // Actions
  play: (track: DeezerTrack) => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setQueue: (tracks: DeezerTrack[]) => void
  addToQueue: (track: DeezerTrack) => void
  removeFromQueue: (index: number) => void
  saveToHistory: (track: DeezerTrack) => Promise<void>

  // Computed
  canGoPrevious: boolean
  canGoNext: boolean
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 30,
  volume: 70,
  isMuted: false,
  queue: [],
  queueIndex: -1,
  autoAdvance: true,
  repeat: 'none',

  play: (track) => {
    const { queue } = get()
    const index = queue.findIndex((t) => t.id === track.id)

    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      queueIndex: index >= 0 ? index : get().queueIndex
    })
  },

  pause: () => set({ isPlaying: false }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  next: () => {
    const { queue, queueIndex, repeat } = get()

    if (repeat === 'one') {
      set({ currentTime: 0, isPlaying: true })
      return
    }

    let nextIndex = queueIndex + 1

    if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0
      } else {
        set({ isPlaying: false })
        return
      }
    }

    const nextTrack = queue[nextIndex]
    set({
      currentTrack: nextTrack,
      queueIndex: nextIndex,
      currentTime: 0,
      isPlaying: true
    })
  },

  previous: () => {
    const { queue, queueIndex, currentTime } = get()

    // If more than 3 seconds, restart current track
    if (currentTime > 3) {
      set({ currentTime: 0 })
      return
    }

    const prevIndex = queueIndex - 1
    if (prevIndex < 0) return

    const prevTrack = queue[prevIndex]
    set({
      currentTrack: prevTrack,
      queueIndex: prevIndex,
      currentTime: 0,
      isPlaying: true
    })
  },

  seek: (time) => set({ currentTime: time }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  setVolume: (volume) => set({ volume, isMuted: false }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  setQueue: (tracks) => {
    set({
      queue: tracks,
      queueIndex: tracks.length > 0 ? 0 : -1
    })

    // Auto-play first track
    if (tracks.length > 0) {
      get().play(tracks[0])
    }
  },

  addToQueue: (track) => {
    set((state) => ({
      queue: [...state.queue, track]
    }))
  },

  removeFromQueue: (index) => {
    set((state) => {
      const newQueue = state.queue.filter((_, i) => i !== index)
      let newIndex = state.queueIndex

      if (index < state.queueIndex) {
        newIndex--
      } else if (index === state.queueIndex) {
        // Current track removed, pause
        return {
          queue: newQueue,
          queueIndex: newIndex,
          isPlaying: false
        }
      }

      return { queue: newQueue, queueIndex: newIndex }
    })
  },

  saveToHistory: async (track) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !track) return

    // Only save if played > 15 seconds (50% of 30s preview)
    if (get().currentTime < 15) return

    await supabase.from('listening_history').insert({
      user_id: user.id,
      track_id: track.id,
      track_name: track.title,
      artist_name: track.artist.name,
      artist_id: track.artist.id,
      album_name: track.album.title,
      duration: track.duration,
      preview_url: track.preview,
      cover_url: track.album.cover_medium,
      play_duration: Math.floor(get().currentTime),
      completed: get().currentTime >= 25, // ~80% of 30s
      played_at: new Date().toISOString()
    })
  },

  get canGoPrevious() {
    return get().queueIndex > 0
  },

  get canGoNext() {
    const { queue, queueIndex, repeat } = get()
    return repeat === 'all' || queueIndex < queue.length - 1
  }
}))
```

---

## Keyboard Shortcuts

**Location**: `hooks/use-keyboard-shortcuts.ts`

```typescript
import { useEffect } from 'react'
import { usePlayerStore } from '@/stores/player-store'

export function useKeyboardShortcuts() {
  const { togglePlay, next, previous, setVolume, toggleMute, volume } =
    usePlayerStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break

        case 'ArrowRight':
          e.preventDefault()
          next()
          break

        case 'ArrowLeft':
          e.preventDefault()
          previous()
          break

        case 'ArrowUp':
          e.preventDefault()
          setVolume(Math.min(volume + 10, 100))
          break

        case 'ArrowDown':
          e.preventDefault()
          setVolume(Math.max(volume - 10, 0))
          break

        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [volume])
}
```

---

## Implementation Strategy

### Phase 1: Core Playback (Week 3, Days 1-2)
1. Audio element setup
2. Basic play/pause
3. PlayerStore creation
4. PlayerBar UI

### Phase 2: Controls (Week 3, Days 3-4)
1. Next/Previous
2. Progress bar with seek
3. Volume control
4. Queue management

### Phase 3: Features (Week 3, Day 5)
1. Auto-advance
2. Keyboard shortcuts
3. Save to history
4. Mobile responsive

### Phase 4: Polish (Week 4, Days 1-2)
1. Animations
2. Error handling
3. Testing
4. Optimization

---

## Performance Optimization

1. **Preload next track**: Preload audio when current track is halfway
2. **Debounce seek**: Debounce slider onChange to reduce re-renders
3. **Memoize components**: Memo components that don't need frequent updates
4. **Lazy load**: Lazy load queue display modal

---

## Success Criteria

- [ ] Plays 30s previews without stuttering
- [ ] All controls work (play/pause/next/prev)
- [ ] Volume control works
- [ ] Auto-advance works
- [ ] Keyboard shortcuts work
- [ ] Mobile responsive
- [ ] Listening history saves correctly
- [ ] < 500ms audio load time
- [ ] All tests passing

---

**Status**: Ready for Implementation
**Estimated Effort**: 4-5 days
**Last Updated**: 2025-10-21
