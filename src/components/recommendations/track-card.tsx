'use client'

import { useState } from 'react'
import { Play, Heart, MoreHorizontal } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useSaveTrack } from '@/hooks/use-saved-tracks'
import { useAuthStore } from '@/store'
import type { DeezerTrack } from '@/types'
import { cn } from '@/lib/utils'

interface TrackCardProps {
  track: DeezerTrack
  onPlay?: (track: DeezerTrack) => void
  isPlaying?: boolean
  isSaved?: boolean
}

export function TrackCard({ track, onPlay, isPlaying, isSaved: initialIsSaved = false }: TrackCardProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const { saveTrack, unsaveTrack, isSaving } = useSaveTrack()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const handleSaveToggle = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save tracks',
        variant: 'destructive',
      })
      return
    }

    try {
      if (isSaved) {
        await unsaveTrack(track.id.toString())
        setIsSaved(false)
        toast({
          title: 'Track removed',
          description: 'Removed from your saved tracks',
        })
      } else {
        await saveTrack(track)
        setIsSaved(true)
        toast({
          title: 'Track saved',
          description: 'Added to your saved tracks',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update track',
        variant: 'destructive',
      })
    }
  }
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className={cn(
      "group overflow-hidden transition-all hover:shadow-md",
      isPlaying && "ring-2 ring-primary"
    )}>
      <div className="flex items-center gap-4 p-4">
        {/* Album Cover */}
        <div className="relative flex-shrink-0">
          <div className="relative h-16 w-16 overflow-hidden rounded-md">
            <Image
              src={track.album.cover_medium}
              alt={track.album.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>

          {/* Play Button Overlay */}
          <button
            onClick={() => onPlay?.(track)}
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100",
              isPlaying && "opacity-100"
            )}
            aria-label={`Play ${track.title}`}
          >
            <Play className="h-6 w-6 text-white fill-white" />
          </button>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {track.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {track.artist.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {track.album.title}
          </p>
        </div>

        {/* Duration */}
        <div className="text-sm text-muted-foreground flex-shrink-0">
          {formatDuration(track.duration)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveToggle}
            disabled={isSaving}
            aria-label={isSaved ? "Unsave track" : "Save track"}
          >
            <Heart className={cn(
              "h-4 w-4",
              isSaved && "fill-red-500 text-red-500"
            )} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
