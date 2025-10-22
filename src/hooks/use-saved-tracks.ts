import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { savedTracksService } from '@/services/saved-tracks-service'
import { useAuthStore } from '@/store'
import type { DeezerTrack } from '@/types'

/**
 * Hook for getting saved tracks
 */
export function useSavedTracks() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['saved-tracks', user?.id],
    queryFn: () => savedTracksService.getSavedTracks(),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook for getting saved track IDs
 */
export function useSavedTrackIds() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['saved-track-ids', user?.id],
    queryFn: () => savedTracksService.getSavedTrackIds(),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook for saving/unsaving tracks
 */
export function useSaveTrack() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const saveMutation = useMutation({
    mutationFn: (track: DeezerTrack) => savedTracksService.saveTrack(track),
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['saved-tracks', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['saved-track-ids', user?.id] })
    },
  })

  const unsaveMutation = useMutation({
    mutationFn: (trackId: string) => savedTracksService.unsaveTrack(trackId),
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['saved-tracks', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['saved-track-ids', user?.id] })
    },
  })

  return {
    saveTrack: saveMutation.mutateAsync,
    unsaveTrack: unsaveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isUnsaving: unsaveMutation.isPending,
  }
}
