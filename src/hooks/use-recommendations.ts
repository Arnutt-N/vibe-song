import { useMutation, useQuery } from '@tanstack/react-query'
import type { MoodState, RecommendationRequest, RecommendationResponse, DeezerTrack } from '@/types'

interface RecommendationApiResponse {
  success: boolean
  data?: RecommendationResponse
  error?: string
  message?: string
}

interface QuickRecommendationsResponse {
  success: boolean
  data?: {
    tracks: DeezerTrack[]
    total: number
  }
  error?: string
}

/**
 * Hook for generating mood-based recommendations
 */
export function useRecommendations() {
  return useMutation({
    mutationFn: async (request: RecommendationRequest) => {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const error: RecommendationApiResponse = await response.json()
        throw new Error(error.message || error.error || 'Failed to get recommendations')
      }

      const data: RecommendationApiResponse = await response.json()

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to get recommendations')
      }

      return data.data
    },
  })
}

/**
 * Hook for getting quick/popular recommendations
 */
export function useQuickRecommendations(limit: number = 20) {
  return useQuery({
    queryKey: ['quick-recommendations', limit],
    queryFn: async () => {
      const response = await fetch(`/api/recommend?limit=${limit}`)

      if (!response.ok) {
        throw new Error('Failed to get quick recommendations')
      }

      const data: QuickRecommendationsResponse = await response.json()

      if (!data.success || !data.data) {
        throw new Error('Failed to get quick recommendations')
      }

      return data.data.tracks
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for getting recommendations by genre
 */
export function useGenreRecommendations(genre: string, limit: number = 20) {
  return useQuery({
    queryKey: ['genre-recommendations', genre, limit],
    queryFn: async () => {
      const response = await fetch(`/api/recommend?genre=${encodeURIComponent(genre)}&limit=${limit}`)

      if (!response.ok) {
        throw new Error('Failed to get genre recommendations')
      }

      const data: QuickRecommendationsResponse = await response.json()

      if (!data.success || !data.data) {
        throw new Error('Failed to get genre recommendations')
      }

      return data.data.tracks
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!genre,
  })
}
