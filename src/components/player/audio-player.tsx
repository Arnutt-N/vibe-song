'use client'

import Image from 'next/image'
import { usePlayerStore } from '@/store'
import { useAudioPlayer } from '@/hooks/use-audio-player'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { PlayerControls } from './player-controls'
import { ProgressBar } from './progress-bar'
import { VolumeControl } from './volume-control'
import { cn } from '@/lib/utils'

export function AudioPlayer() {
  const { currentTrack } = usePlayerStore()

  // Initialize audio player and keyboard shortcuts
  useAudioPlayer()
  useKeyboardShortcuts()

  // Don't show player if no track
  if (!currentTrack) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Album Art */}
            <div className="relative h-14 w-14 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={currentTrack.album.cover_medium}
                alt={currentTrack.album.title}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>

            {/* Track Details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.artist.name}
              </p>
            </div>
          </div>

          {/* Player Controls Section */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
            {/* Controls */}
            <PlayerControls />

            {/* Progress Bar */}
            <div className="w-full hidden sm:block">
              <ProgressBar />
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-end flex-1 min-w-0">
            <VolumeControl />
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="mt-2 sm:hidden">
          <ProgressBar />
        </div>
      </div>

      {/* Preview Notice */}
      <div className="absolute top-0 right-4 -translate-y-1/2">
        <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20">
          30s Preview
        </div>
      </div>
    </div>
  )
}
