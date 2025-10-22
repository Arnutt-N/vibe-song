# Technical Plan: Mood Input Interface

## Document Information
- **Specification**: [mood-input-interface.md](../../openspec/changes/mood-input-interface.md)
- **Created**: 2025-10-21
- **Status**: Ready for Implementation
- **Version**: 1.0

---

## Architecture Overview

The Mood Input Interface is a client-side React component that captures user emotional state through emoji selection and slider inputs. It uses Zustand for state management and integrates with the Recommendation API.

```
User Interaction
    ↓
EmojiSelector / SliderControls (React Components)
    ↓
useMoodStore (Zustand)
    ↓
API Call: POST /api/recommendations
    ↓
Navigate to Results Page
```

---

## Components Structure

### 1. Page Component

**Location**: `app/discover/page.tsx`

```typescript
// Server Component
export default function DiscoverPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader />
      <MoodInputInterface />
    </div>
  )
}
```

---

### 2. Main Component

**Location**: `components/mood/mood-input-interface.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useMoodStore } from '@/stores/mood-store'
import { EmojiSelector } from './emoji-selector'
import { MoodSliders } from './mood-sliders'
import { FindMusicButton } from './find-music-button'
import { MoodHistory } from './mood-history'

export function MoodInputInterface() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>How are you feeling?</CardTitle>
        <CardDescription>
          Select your mood and we'll find the perfect music
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mood History (logged-in users only) */}
        <MoodHistory />

        {/* Emoji Selector */}
        <EmojiSelector />

        {/* Sliders */}
        <MoodSliders />

        {/* Find Music Button */}
        <FindMusicButton isLoading={isLoading} />
      </CardContent>
    </Card>
  )
}
```

---

### 3. Emoji Selector Component

**Location**: `components/mood/emoji-selector.tsx`

```typescript
'use client'

import { useMoodStore } from '@/stores/mood-store'
import { MOOD_MAP } from '@/lib/constants/mood-map'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EmojiSelector() {
  const { selectedEmoji, setMood } = useMoodStore()

  const moods = Object.entries(MOOD_MAP)

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Choose your mood</label>

      <div className="grid grid-cols-4 gap-3">
        {moods.map(([emoji, config]) => (
          <Button
            key={emoji}
            variant={selectedEmoji === emoji ? 'default' : 'outline'}
            size="lg"
            className={cn(
              'h-20 text-4xl transition-all',
              selectedEmoji === emoji && 'ring-2 ring-primary scale-105'
            )}
            onClick={() => setMood(emoji)}
            aria-label={config.label}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  )
}
```

---

### 4. Mood Sliders Component

**Location**: `components/mood/mood-sliders.tsx`

```typescript
'use client'

import { useMoodStore } from '@/stores/mood-store'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

export function MoodSliders() {
  const { energyLevel, moodValence, setEnergyLevel, setMoodValence } = useMoodStore()

  return (
    <div className="space-y-6">
      {/* Energy Level Slider */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Energy Level</Label>
          <span className="text-sm text-muted-foreground">{energyLevel}/10</span>
        </div>

        <Slider
          value={[energyLevel]}
          onValueChange={([value]) => setEnergyLevel(value)}
          min={1}
          max={10}
          step={1}
          className="w-full"
          aria-label="Energy level"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>😴 Calm</span>
          <span>⚡ Intense</span>
        </div>
      </div>

      {/* Mood Valence Slider */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Mood</Label>
          <span className="text-sm text-muted-foreground">{moodValence}/10</span>
        </div>

        <Slider
          value={[moodValence]}
          onValueChange={([value]) => setMoodValence(value)}
          min={1}
          max={10}
          step={1}
          className="w-full"
          aria-label="Mood valence"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>😢 Negative</span>
          <span>😊 Positive</span>
        </div>
      </div>
    </div>
  )
}
```

---

### 5. Find Music Button Component

**Location**: `components/mood/find-music-button.tsx`

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useMoodStore } from '@/stores/mood-store'
import { Button } from '@/components/ui/button'
import { Music } from 'lucide-react'
import { useState } from 'react'

interface FindMusicButtonProps {
  isLoading: boolean
}

export function FindMusicButton({ isLoading }: FindMusicButtonProps) {
  const router = useRouter()
  const { selectedEmoji, energyLevel, moodValence, saveMoodSession } = useMoodStore()

  const handleFindMusic = async () => {
    if (!selectedEmoji) return

    // Save mood session (if logged in)
    await saveMoodSession()

    // Navigate to recommendations with mood params
    const params = new URLSearchParams({
      mood: selectedEmoji,
      energy: energyLevel.toString(),
      valence: moodValence.toString()
    })

    router.push(`/recommendations?${params}`)
  }

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={!selectedEmoji || isLoading}
      onClick={handleFindMusic}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Finding music...
        </>
      ) : (
        <>
          <Music className="mr-2 h-4 w-4" />
          Find Music
        </>
      )}
    </Button>
  )
}
```

---

### 6. Mood History Component

**Location**: `components/mood/mood-history.tsx`

```typescript
'use client'

import { useAuthStore } from '@/stores/auth-store'
import { useMoodStore } from '@/stores/mood-store'
import { useMoodHistory } from '@/hooks/use-mood-history'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

export function MoodHistory() {
  const { isAuthenticated } = useAuthStore()
  const { setMoodFromHistory } = useMoodStore()
  const { data: history, isLoading } = useMoodHistory()

  if (!isAuthenticated || isLoading || !history?.length) {
    return null
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        Recent moods
      </label>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {history.slice(0, 3).map((session) => (
          <Button
            key={session.id}
            variant="ghost"
            size="sm"
            className="flex-shrink-0"
            onClick={() => setMoodFromHistory(session)}
          >
            <span className="text-xl mr-2">{session.mood_emoji}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
```

---

## State Management

### Zustand Store

**Location**: `stores/mood-store.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOOD_MAP } from '@/lib/constants/mood-map'
import { supabase } from '@/lib/supabase'

interface MoodState {
  // Current mood
  selectedEmoji: string | null
  energyLevel: number
  moodValence: number

  // History
  recentMoods: MoodSession[]

  // Actions
  setMood: (emoji: string) => void
  setEnergyLevel: (level: number) => void
  setMoodValence: (valence: number) => void
  setMoodFromHistory: (session: MoodSession) => void
  saveMoodSession: () => Promise<void>
  reset: () => void
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      selectedEmoji: null,
      energyLevel: 5,
      moodValence: 5,
      recentMoods: [],

      setMood: (emoji) => {
        const config = MOOD_MAP[emoji]
        if (!config) return

        set({
          selectedEmoji: emoji,
          // Auto-set sliders to defaults for this mood
          energyLevel: config.defaultEnergy,
          moodValence: config.defaultValence
        })
      },

      setEnergyLevel: (level) => set({ energyLevel: level }),

      setMoodValence: (valence) => set({ moodValence: valence }),

      setMoodFromHistory: (session) => {
        set({
          selectedEmoji: session.mood_emoji,
          energyLevel: session.energy_level,
          moodValence: session.mood_valence
        })
      },

      saveMoodSession: async () => {
        const { selectedEmoji, energyLevel, moodValence } = get()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !selectedEmoji) return

        const session = {
          user_id: user.id,
          mood_emoji: selectedEmoji,
          energy_level: energyLevel,
          mood_valence: moodValence,
          time_of_day: getTimeOfDay(),
          day_of_week: new Date().getDay()
        }

        await supabase.from('mood_sessions').insert(session)
      },

      reset: () => set({
        selectedEmoji: null,
        energyLevel: 5,
        moodValence: 5
      })
    }),
    {
      name: 'mood-storage',
      partialize: (state) => ({
        // Only persist mood selection
        selectedEmoji: state.selectedEmoji,
        energyLevel: state.energyLevel,
        moodValence: state.moodValence
      })
    }
  )
)

function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  if (hour < 22) return 'evening'
  return 'night'
}
```

---

## Data Models

### Mood Configuration

**Location**: `lib/constants/mood-map.ts`

```typescript
export interface MoodConfig {
  emoji: string
  label: string
  keywords: string[]
  genres: string[]
  lastfmTags: string[]
  defaultEnergy: number
  defaultValence: number
  energyRange: [number, number]
  valenceRange: [number, number]
}

export const MOOD_MAP: Record<string, MoodConfig> = {
  '😊': {
    emoji: '😊',
    label: 'Happy & Cheerful',
    keywords: ['happy', 'upbeat', 'cheerful', 'joyful'],
    genres: ['pop', 'dance', 'funk'],
    lastfmTags: ['happy', 'upbeat', 'feel-good', 'positive'],
    defaultEnergy: 7,
    defaultValence: 8,
    energyRange: [6, 10],
    valenceRange: [7, 10]
  },
  '😢': {
    emoji: '😢',
    label: 'Sad & Emotional',
    keywords: ['sad', 'emotional', 'melancholic', 'heartbreak'],
    genres: ['ballad', 'acoustic', 'indie'],
    lastfmTags: ['sad', 'emotional', 'melancholy', 'heartbreak'],
    defaultEnergy: 3,
    defaultValence: 3,
    energyRange: [1, 4],
    valenceRange: [1, 4]
  },
  '😌': {
    emoji: '😌',
    label: 'Calm & Relaxed',
    keywords: ['calm', 'chill', 'relaxing', 'peaceful'],
    genres: ['ambient', 'chillout', 'lounge', 'classical'],
    lastfmTags: ['chill', 'relaxing', 'calm', 'peaceful'],
    defaultEnergy: 3,
    defaultValence: 6,
    energyRange: [2, 5],
    valenceRange: [5, 8]
  },
  '🔥': {
    emoji: '🔥',
    label: 'Energetic & Hype',
    keywords: ['energetic', 'party', 'hype', 'intense'],
    genres: ['edm', 'dance', 'electronic', 'hip-hop'],
    lastfmTags: ['energetic', 'party', 'dance', 'hype'],
    defaultEnergy: 9,
    defaultValence: 8,
    energyRange: [8, 10],
    valenceRange: [6, 10]
  },
  '💭': {
    emoji: '💭',
    label: 'Thoughtful & Introspective',
    keywords: ['thoughtful', 'introspective', 'deep', 'contemplative'],
    genres: ['indie', 'alternative', 'folk', 'singer-songwriter'],
    lastfmTags: ['introspective', 'thoughtful', 'indie', 'melancholic'],
    defaultEnergy: 4,
    defaultValence: 5,
    energyRange: [3, 6],
    valenceRange: [4, 7]
  },
  '😴': {
    emoji: '😴',
    label: 'Sleepy & Dreamy',
    keywords: ['sleepy', 'dreamy', 'soft', 'lullaby'],
    genres: ['ambient', 'classical', 'new-age', 'acoustic'],
    lastfmTags: ['sleep', 'dreamy', 'soft', 'relaxing'],
    defaultEnergy: 2,
    defaultValence: 5,
    energyRange: [1, 3],
    valenceRange: [4, 7]
  },
  '💪': {
    emoji: '💪',
    label: 'Workout & Motivated',
    keywords: ['workout', 'motivation', 'powerful', 'strong'],
    genres: ['rock', 'metal', 'hip-hop', 'electronic'],
    lastfmTags: ['workout', 'motivational', 'powerful', 'intense'],
    defaultEnergy: 8,
    defaultValence: 7,
    energyRange: [7, 10],
    valenceRange: [5, 9]
  },
  '🎉': {
    emoji: '🎉',
    label: 'Party & Celebration',
    keywords: ['party', 'celebration', 'fun', 'festive'],
    genres: ['pop', 'dance', 'latin', 'disco'],
    lastfmTags: ['party', 'dance', 'fun', 'upbeat'],
    defaultEnergy: 9,
    defaultValence: 9,
    energyRange: [8, 10],
    valenceRange: [8, 10]
  }
}
```

---

## Hooks

### useMoodHistory Hook

**Location**: `hooks/use-mood-history.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

export function useMoodHistory() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['mood-history', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('mood_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
```

---

## Styling

### Tailwind Configuration

Ensure dark mode and custom colors:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vibe: {
          purple: '#8B5CF6',
          pink: '#EC4899'
        }
      }
    }
  }
}
```

### Custom Slider Styles

```css
/* app/globals.css */
.slider-track {
  background: linear-gradient(
    to right,
    hsl(var(--muted)) 0%,
    hsl(var(--primary)) 100%
  );
}
```

---

## Implementation Strategy

### Phase 1: Core UI (Week 1, Days 1-2)
**Goal**: Basic mood selection works

**Tasks**:
1. Create page structure (`app/discover/page.tsx`)
2. Implement `EmojiSelector` component
3. Implement `MoodSliders` component
4. Setup Zustand store
5. Wire up basic interactions

**Deliverable**: Users can select emoji and adjust sliders

---

### Phase 2: Integration (Week 1, Days 3-4)
**Goal**: Connect to recommendation flow

**Tasks**:
1. Implement `FindMusicButton` with navigation
2. Pass mood params to recommendation page
3. Persist mood selection in store
4. Add loading states

**Deliverable**: Clicking "Find Music" navigates with correct params

---

### Phase 3: History & Polish (Week 1, Day 5)
**Goal**: Add mood history and refinements

**Tasks**:
1. Implement `MoodHistory` component
2. Create `useMoodHistory` hook
3. Integrate with Supabase
4. Add animations and transitions
5. Mobile responsive testing

**Deliverable**: Logged-in users see mood history

---

### Phase 4: Accessibility & Testing (Week 2, Days 1-2)
**Goal**: Ensure accessibility and quality

**Tasks**:
1. Add ARIA labels
2. Keyboard navigation
3. Screen reader testing
4. Write unit tests
5. Write integration tests
6. Cross-browser testing

**Deliverable**: Fully accessible and tested

---

## Testing Strategy

### Unit Tests

**Location**: `__tests__/components/mood/`

```typescript
// emoji-selector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { EmojiSelector } from '@/components/mood/emoji-selector'

describe('EmojiSelector', () => {
  it('renders all 8 mood emojis', () => {
    render(<EmojiSelector />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(8)
  })

  it('selects emoji on click', () => {
    render(<EmojiSelector />)
    const happyButton = screen.getByLabelText(/happy/i)
    fireEvent.click(happyButton)
    expect(happyButton).toHaveClass('ring-2')
  })

  it('only one emoji selected at a time', () => {
    render(<EmojiSelector />)
    const buttons = screen.getAllByRole('button')

    fireEvent.click(buttons[0])
    fireEvent.click(buttons[1])

    const selected = buttons.filter(b => b.classList.contains('ring-2'))
    expect(selected).toHaveLength(1)
  })
})
```

### Integration Tests

```typescript
// mood-input-interface.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MoodInputInterface } from '@/components/mood/mood-input-interface'

describe('MoodInputInterface', () => {
  it('enables Find Music button when mood selected', () => {
    render(<MoodInputInterface />)

    const button = screen.getByText(/find music/i)
    expect(button).toBeDisabled()

    const emoji = screen.getByLabelText(/happy/i)
    fireEvent.click(emoji)

    expect(button).toBeEnabled()
  })

  it('auto-adjusts sliders when emoji selected', () => {
    render(<MoodInputInterface />)

    const emoji = screen.getByLabelText(/happy/i)
    fireEvent.click(emoji)

    // Check if sliders moved to happy defaults
    const energySlider = screen.getByLabelText(/energy/i)
    expect(energySlider).toHaveValue('7')
  })
})
```

### E2E Tests

```typescript
// e2e/mood-selection.spec.ts
import { test, expect } from '@playwright/test'

test('complete mood selection flow', async ({ page }) => {
  await page.goto('/discover')

  // Select happy mood
  await page.click('button[aria-label*="Happy"]')

  // Adjust energy slider
  await page.locator('input[aria-label="Energy level"]').fill('8')

  // Click Find Music
  await page.click('button:has-text("Find Music")')

  // Should navigate to recommendations
  await expect(page).toHaveURL(/\/recommendations/)
  await expect(page.url()).toContain('mood=%F0%9F%98%8A')
})
```

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Load History**:
   ```typescript
   const MoodHistory = lazy(() => import('./mood-history'))
   ```

2. **Debounce Slider Changes**:
   ```typescript
   const debouncedSetEnergy = useMemo(
     () => debounce(setEnergyLevel, 100),
     []
   )
   ```

3. **Memoize Mood Buttons**:
   ```typescript
   const EmojiButton = memo(({ emoji, isSelected, onClick }) => (
     <Button ... />
   ))
   ```

4. **Preload Recommendation Route**:
   ```typescript
   useEffect(() => {
     if (selectedEmoji) {
       router.prefetch('/recommendations')
     }
   }, [selectedEmoji])
   ```

---

## Security Considerations

### Input Validation

```typescript
// Validate emoji is in allowed list
const isValidEmoji = (emoji: string): boolean => {
  return emoji in MOOD_MAP
}

// Validate slider values
const isValidRange = (value: number): boolean => {
  return value >= 1 && value <= 10 && Number.isInteger(value)
}
```

### XSS Prevention

- Use React's built-in escaping (no `dangerouslySetInnerHTML`)
- Validate all user inputs
- Sanitize data before sending to API

---

## Dependencies

### npm Packages

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "lucide-react": "^0.292.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@playwright/test": "^1.40.0",
    "vitest": "^1.0.0"
  }
}
```

### UI Components (shadcn/ui)

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add label
```

---

## Risks & Mitigations

### Risk 1: Slider Performance on Mobile

**Risk**: Slider updates might be laggy on low-end devices

**Mitigation**:
- Debounce slider onChange
- Use CSS transforms instead of reflows
- Test on actual devices

### Risk 2: Emoji Display Inconsistency

**Risk**: Emojis look different across platforms

**Mitigation**:
- Use emoji with good cross-platform support
- Test on iOS, Android, Windows, Mac
- Consider using emoji library if needed

### Risk 3: State Persistence Issues

**Risk**: Zustand persist might fail in some browsers

**Mitigation**:
- Wrap in try-catch
- Graceful fallback to default state
- Test in private/incognito mode

---

## Timeline Estimate

### Development: 3-4 days

**Day 1**: Components & UI (4-6 hours)
- EmojiSelector
- MoodSliders
- FindMusicButton
- Basic styling

**Day 2**: State & Logic (4-6 hours)
- Zustand store
- Mood mapping
- Integration with navigation

**Day 3**: History & Polish (3-4 hours)
- MoodHistory component
- Hook creation
- Animations & transitions
- Mobile responsive

**Day 4**: Testing (3-4 hours)
- Unit tests
- Integration tests
- E2E test
- Accessibility audit

**Total**: 14-20 hours (2-3 days with full focus, 3-4 days with normal pace)

---

## Success Criteria

- [ ] All 8 moods selectable
- [ ] Sliders adjust smoothly (60fps)
- [ ] Button enables/disables correctly
- [ ] Navigation passes correct params
- [ ] Mood persists in localStorage
- [ ] History shows for logged-in users
- [ ] Mobile responsive (320px+)
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance budget met (< 2s load)

---

## Related Documents

- **Specification**: [mood-input-interface.md](../../openspec/changes/mood-input-interface.md)
- **Data Models**: [data-models.md](../architecture/data-models.md)
- **System Design**: [system-design.md](../architecture/system-design.md)
- **Tech Stack**: [tech-stack.md](../architecture/tech-stack.md)

---

**Status**: Ready for Implementation
**Next Step**: Begin coding with `/implement mood-input-interface`
**Estimated Effort**: 2-4 days
**Last Updated**: 2025-10-21
**Version**: 1.0
