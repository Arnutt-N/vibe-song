'use client'

import { useState } from 'react'
import { Music2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMoodStore } from '@/store'
import { useToast } from '@/components/ui/use-toast'
import { moodService } from '@/services/mood-service'

interface FindMusicButtonProps {
  onFindMusic?: () => void
}

export function FindMusicButton({ onFindMusic }: FindMusicButtonProps) {
  const { emoji, energyLevel, moodValence } = useMoodStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const isDisabled = !emoji || isLoading

  const handleClick = async () => {
    if (!emoji) {
      toast({
        title: "Please select a mood",
        description: "Choose an emoji that represents how you're feeling.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Save mood session
      await moodService.saveMoodSession(emoji, energyLevel, moodValence)

      // TODO: Call recommendation API when implemented
      // For now, just show a success message
      toast({
        title: "Finding your perfect vibe...",
        description: `Looking for ${emoji} vibes with energy ${energyLevel}/10`,
      })

      // Call the parent callback if provided
      if (onFindMusic) {
        onFindMusic()
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      size="lg"
      className="w-full text-base font-semibold"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label="Find music based on your mood"
    >
      <Music2 className="mr-2 h-5 w-5" />
      {isLoading ? "Finding Music..." : "Find Music for My Vibe"}
    </Button>
  )
}
