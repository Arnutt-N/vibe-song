'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EmojiSelector } from './emoji-selector'
import { MoodSliders } from './mood-sliders'
import { FindMusicButton } from './find-music-button'
import { MoodHistory } from './mood-history'

interface MoodInputInterfaceProps {
  onFindMusic?: () => void
}

export function MoodInputInterface({ onFindMusic }: MoodInputInterfaceProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">What's your vibe?</CardTitle>
        <CardDescription>
          Tell us how you're feeling, and we'll find the perfect music for you
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mood History */}
        <MoodHistory />

        {/* Emoji Selector */}
        <EmojiSelector />

        <Separator />

        {/* Mood Sliders */}
        <MoodSliders />

        <Separator />

        {/* Find Music Button */}
        <FindMusicButton onFindMusic={onFindMusic} />
      </CardContent>
    </Card>
  )
}
