'use client'

import { useState } from 'react'
import { MoodInputInterface } from '@/components/mood'
import { RecommendationsList } from '@/components/recommendations'
import { useRecommendations } from '@/hooks/use-recommendations'
import { useMoodStore } from '@/store'
import type { DeezerTrack } from '@/types'

export default function Home() {
  const { emoji, energyLevel, moodValence } = useMoodStore()
  const [recommendations, setRecommendations] = useState<DeezerTrack[]>([])
  const recommendationsMutation = useRecommendations()

  const handleFindMusic = async () => {
    if (!emoji) return

    try {
      const result = await recommendationsMutation.mutateAsync({
        mood: {
          emoji,
          energyLevel,
          moodValence,
        },
        limit: 20,
      })

      setRecommendations(result.tracks)
    } catch (error) {
      console.error('Failed to get recommendations:', error)
      setRecommendations([])
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-24">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Vibe-Song 🎵
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover music that matches your vibe
          </p>
        </div>

        {/* Mood Input Interface */}
        <div className="flex justify-center">
          <MoodInputInterface onFindMusic={handleFindMusic} />
        </div>

        {/* Recommendations List */}
        {(recommendations.length > 0 || recommendationsMutation.isPending) && (
          <RecommendationsList
            tracks={recommendations}
            isLoading={recommendationsMutation.isPending}
            mood={emoji}
          />
        )}

        {/* Info Section */}
        {recommendations.length === 0 && !recommendationsMutation.isPending && (
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Select your mood, adjust the sliders, and let us find the perfect music for you
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
