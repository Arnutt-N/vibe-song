'use client'

import { useMoodStore } from '@/store'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { ENERGY_LEVEL_LABELS, MOOD_VALENCE_LABELS } from '@/lib/constants'

export function MoodSliders() {
  const { energyLevel, moodValence, setEnergyLevel, setMoodValence } = useMoodStore()

  const energyLabel = ENERGY_LEVEL_LABELS[energyLevel as keyof typeof ENERGY_LEVEL_LABELS]
  const valenceLabel = MOOD_VALENCE_LABELS[moodValence as keyof typeof MOOD_VALENCE_LABELS]

  return (
    <div className="space-y-6">
      {/* Energy Level Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="energy-slider" className="text-base font-medium">
            Energy Level
          </Label>
          <span className="text-sm font-semibold text-primary">
            {energyLevel}/10 - {energyLabel}
          </span>
        </div>
        <Slider
          id="energy-slider"
          min={1}
          max={10}
          step={1}
          value={[energyLevel]}
          onValueChange={(value) => setEnergyLevel(value[0])}
          className="w-full"
          aria-label="Energy level slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low Energy</span>
          <span>High Energy</span>
        </div>
      </div>

      {/* Mood Valence Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="valence-slider" className="text-base font-medium">
            Mood Valence
          </Label>
          <span className="text-sm font-semibold text-primary">
            {moodValence}/10 - {valenceLabel}
          </span>
        </div>
        <Slider
          id="valence-slider"
          min={1}
          max={10}
          step={1}
          value={[moodValence]}
          onValueChange={(value) => setMoodValence(value[0])}
          className="w-full"
          aria-label="Mood valence slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Negative</span>
          <span>Positive</span>
        </div>
      </div>

      {/* Helper text */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Energy Level:</strong> How energetic or calm you want the music to be.
          <br />
          <strong>Mood Valence:</strong> How positive or negative the emotional tone should be.
        </p>
      </div>
    </div>
  )
}
