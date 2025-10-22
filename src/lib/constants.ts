import type { MoodConfig, MoodEmoji } from '@/types'

export const MOOD_MAP: Record<MoodEmoji, MoodConfig> = {
  '😊': {
    emoji: '😊',
    label: 'Happy',
    description: 'Feeling joyful and upbeat',
    energyRange: [6, 10],
    valenceRange: [7, 10],
    genres: ['pop', 'dance', 'funk', 'disco'],
    tags: ['happy', 'upbeat', 'positive', 'cheerful', 'fun'],
  },
  '😢': {
    emoji: '😢',
    label: 'Sad',
    description: 'Feeling down or melancholic',
    energyRange: [1, 4],
    valenceRange: [1, 3],
    genres: ['indie', 'acoustic', 'blues', 'soul'],
    tags: ['sad', 'melancholic', 'emotional', 'heartbreak', 'lonely'],
  },
  '😌': {
    emoji: '😌',
    label: 'Calm',
    description: 'Feeling peaceful and relaxed',
    energyRange: [1, 5],
    valenceRange: [5, 8],
    genres: ['ambient', 'classical', 'jazz', 'chill'],
    tags: ['calm', 'peaceful', 'relaxing', 'chill', 'meditative'],
  },
  '🔥': {
    emoji: '🔥',
    label: 'Energetic',
    description: 'Feeling pumped and energized',
    energyRange: [8, 10],
    valenceRange: [6, 10],
    genres: ['rock', 'edm', 'hip-hop', 'metal'],
    tags: ['energetic', 'intense', 'powerful', 'hype', 'aggressive'],
  },
  '💭': {
    emoji: '💭',
    label: 'Thoughtful',
    description: 'Feeling contemplative and introspective',
    energyRange: [3, 6],
    valenceRange: [4, 6],
    genres: ['indie', 'alternative', 'folk', 'singer-songwriter'],
    tags: ['thoughtful', 'introspective', 'contemplative', 'deep', 'meaningful'],
  },
  '😴': {
    emoji: '😴',
    label: 'Sleepy',
    description: 'Feeling drowsy and relaxed',
    energyRange: [1, 3],
    valenceRange: [4, 7],
    genres: ['ambient', 'lo-fi', 'classical', 'acoustic'],
    tags: ['sleepy', 'dreamy', 'soft', 'gentle', 'lullaby'],
  },
  '💪': {
    emoji: '💪',
    label: 'Motivated',
    description: 'Feeling determined and focused',
    energyRange: [7, 9],
    valenceRange: [6, 9],
    genres: ['rock', 'hip-hop', 'electronic', 'pop'],
    tags: ['motivational', 'inspiring', 'empowering', 'determined', 'focused'],
  },
  '🎉': {
    emoji: '🎉',
    label: 'Party',
    description: 'Feeling festive and ready to celebrate',
    energyRange: [8, 10],
    valenceRange: [8, 10],
    genres: ['dance', 'pop', 'edm', 'latin'],
    tags: ['party', 'celebratory', 'festive', 'dance', 'uplifting'],
  },
}

export const MOOD_EMOJIS: MoodEmoji[] = ['😊', '😢', '😌', '🔥', '💭', '😴', '💪', '🎉']

export const ENERGY_LEVEL_LABELS = {
  1: 'Very Low',
  2: 'Low',
  3: 'Low',
  4: 'Medium-Low',
  5: 'Medium',
  6: 'Medium',
  7: 'Medium-High',
  8: 'High',
  9: 'High',
  10: 'Very High',
} as const

export const MOOD_VALENCE_LABELS = {
  1: 'Very Negative',
  2: 'Negative',
  3: 'Negative',
  4: 'Slightly Negative',
  5: 'Neutral',
  6: 'Slightly Positive',
  7: 'Positive',
  8: 'Positive',
  9: 'Very Positive',
  10: 'Extremely Positive',
} as const
