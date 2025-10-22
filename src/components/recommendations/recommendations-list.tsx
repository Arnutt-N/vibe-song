'use client'

import { Music2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrackCard } from './track-card'
import type { DeezerTrack, MoodEmoji } from '@/types'
import { MOOD_MAP } from '@/lib/constants'

interface RecommendationsListProps {
  tracks: DeezerTrack[]
  isLoading?: boolean
  mood?: MoodEmoji | null
  onPlayTrack?: (track: DeezerTrack) => void
  onSaveTrack?: (track: DeezerTrack) => void
  currentTrackId?: number
  savedTrackIds?: Set<number>
}

export function RecommendationsList({
  tracks,
  isLoading,
  mood,
  onPlayTrack,
  onSaveTrack,
  currentTrackId,
  savedTrackIds = new Set(),
}: RecommendationsListProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Finding your perfect vibe...</p>
          <p className="text-sm text-muted-foreground mt-2">
            This may take a few seconds
          </p>
        </CardContent>
      </Card>
    )
  }

  if (tracks.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Music2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No recommendations yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Select your mood above to get personalized music recommendations
          </p>
        </CardContent>
      </Card>
    )
  }

  const moodConfig = mood ? MOOD_MAP[mood] : null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mood && <span className="text-3xl">{mood}</span>}
          <span>
            {moodConfig ? `${moodConfig.label} Vibes` : 'Your Recommendations'}
          </span>
        </CardTitle>
        <CardDescription>
          {moodConfig
            ? `${tracks.length} tracks that match your ${moodConfig.label.toLowerCase()} mood`
            : `${tracks.length} recommended tracks for you`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {tracks.map((track, index) => (
          <TrackCard
            key={`${track.id}-${index}`}
            track={track}
            onPlay={onPlayTrack}
            onSave={onSaveTrack}
            isPlaying={currentTrackId === track.id}
            isSaved={savedTrackIds.has(track.id)}
          />
        ))}
      </CardContent>
    </Card>
  )
}
