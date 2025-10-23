// Copy this file to config.ts and fill in your API credentials

export const config = {
  // Spotify API
  // Get from: https://developer.spotify.com/dashboard
  spotify: {
    clientId: 'YOUR_SPOTIFY_CLIENT_ID',
    clientSecret: 'YOUR_SPOTIFY_CLIENT_SECRET',
  },

  // YouTube Data API v3
  // Get from: https://console.cloud.google.com
  youtube: {
    apiKey: 'YOUR_YOUTUBE_API_KEY',
    quotaLimit: 50, // Daily search limit (conservative)
  },

  // Deezer API (no key required)
  deezer: {
    baseUrl: 'https://api.deezer.com',
  },

  // Collection settings
  collection: {
    // Output directory
    outputDir: './data',

    // Cache directory
    cacheDir: './data/cache',

    // Log directory
    logDir: './logs',

    // Default limits
    defaultLimit: 50,

    // Rate limiting (ms between requests)
    rateLimits: {
      spotify: 100,  // 100ms between requests
      youtube: 1000, // 1s between requests (conservative)
      deezer: 1000,  // 1s between requests
    },
  },

  // Data quality settings
  quality: {
    // Minimum Spotify popularity score (0-100)
    minPopularity: 30,

    // Maximum song duration (seconds)
    maxDuration: 360, // 6 minutes

    // Require YouTube link
    requireYouTube: true,

    // Lyrics snippet max length
    lyricsMaxLength: 150,
  },

  // Genre mappings
  genres: {
    thai: {
      'ลูกทุ่ง': ['luk thung', 'thai country'],
      'ลูกกรุง': ['luk krung', 'thai pop'],
      'สตริง': ['string', 'thai folk'],
      'หมอลำ': ['mor lam', 'molam', 'isaan'],
      'เพลงใต้': ['southern thai'],
      'เพื่อชีวิต': ['songs for life', 'phleng phuea chiwit'],
      'สามช่า': ['sam cha', '3 cha'],
    },
    international: {
      'K-pop': ['k-pop', 'korean pop'],
      'C-pop': ['c-pop', 'chinese pop', 'mandopop', 'cantopop'],
      'J-pop': ['j-pop', 'japanese pop'],
      'Western': ['pop', 'rock', 'r&b'],
    },
  },

  // Search queries for different genres
  searchQueries: {
    thai: {
      'ลูกทุ่ง': [
        'ลูกทุ่ง คาราโอเกะ',
        'ลูกทุ่ง ฮิต',
        'luk thung hits',
      ],
      'ลูกกรุง': [
        'ลูกกรุง 2024',
        'thai pop hits',
        'เพลงไทยฮิต',
      ],
      'สตริง': [
        'สตริง เพราะๆ',
        'string music',
      ],
      'หมอลำ': [
        'หมอลำ อีสาน',
        'mor lam isaan',
      ],
    },
    kpop: [
      'k-pop karaoke',
      'kpop hits 2024',
      'korean pop songs',
    ],
    jpop: [
      'j-pop karaoke',
      'japanese pop hits',
      'anime songs',
    ],
    western: [
      'karaoke classics',
      'pop karaoke songs',
      'rock karaoke',
    ],
  },

  // Curated playlist IDs (Spotify)
  playlists: {
    thai: [
      // Add actual playlist IDs here
      // Example: '37i9dQZF1DX4UtSsGT1Sbe'
    ],
    kpop: [
      // K-pop playlist IDs
    ],
    jpop: [
      // J-pop playlist IDs
    ],
  },
}

export type Config = typeof config
