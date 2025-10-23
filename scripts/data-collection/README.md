# Data Collection Scripts

**Purpose**: Ethical and legal data collection for Karaoke AI song database

**Target**: 100-200 high-quality Thai and International songs for Phase 1 MVP

---

## Overview

These scripts collect song metadata from legal public APIs:
- **Spotify Web API**: Song metadata, popularity, genres
- **YouTube Data API v3**: Video links, validation
- **Deezer API**: Additional metadata
- **Manual Input**: Thai songs from curated lists

---

## Features

✅ **Legal & Ethical**
- Only public APIs with proper authentication
- Respects rate limits
- No scraping of copyrighted lyrics
- Adheres to Terms of Service

✅ **High Quality**
- Validates all data before export
- Checks YouTube links availability
- Deduplicates entries
- Manual curation supported

✅ **Flexible**
- Multiple data sources
- Configurable output format
- CSV export ready for database import
- TypeScript for type safety

---

## Prerequisites

### Required API Keys

1. **Spotify API** (Free)
   - Go to: https://developer.spotify.com/dashboard
   - Create app
   - Get Client ID and Client Secret

2. **YouTube Data API v3** (Free, 10k units/day)
   - Go to: https://console.cloud.google.com
   - Enable YouTube Data API v3
   - Get API Key

3. **Deezer API** (Free, no key required)
   - Public API, no authentication needed

### Installation

```bash
cd scripts/data-collection
npm install
```

### Configuration

```bash
# Copy config template
cp config.example.ts config.ts

# Edit config.ts with your API keys
```

---

## Usage

### Quick Start

```bash
# Collect 100 songs (mixed Thai + International)
npm run collect -- --count 100

# Collect Thai songs only
npm run collect:thai -- --count 50

# Collect K-pop songs
npm run collect:kpop -- --count 30

# Validate and export to CSV
npm run export
```

### Step-by-Step

#### 1. Collect Songs from Spotify

```bash
npm run collect:spotify -- \
  --playlist "Thai Karaoke Hits" \
  --limit 50 \
  --output data/spotify-thai.json
```

#### 2. Search YouTube Links

```bash
npm run youtube:search -- \
  --input data/spotify-thai.json \
  --output data/with-youtube.json
```

#### 3. Validate Data

```bash
npm run validate -- \
  --input data/with-youtube.json
```

#### 4. Export to CSV

```bash
npm run export -- \
  --input data/with-youtube.json \
  --output songs.csv
```

---

## Scripts Reference

### `collect-spotify.ts`

Collects songs from Spotify playlists or search.

```typescript
import { SpotifyCollector } from './spotify-collector'

const collector = new SpotifyCollector({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
})

// From playlist
const songs = await collector.fromPlaylist('playlist_id')

// From search
const songs = await collector.search('ลูกทุ่ง', { limit: 50 })
```

**Options**:
- `--playlist <id>`: Spotify playlist ID
- `--search <query>`: Search query
- `--limit <number>`: Max results (default: 50)
- `--market <code>`: Market code (TH, US, KR, JP)

### `youtube-search.ts`

Finds YouTube video links for songs.

```typescript
import { YouTubeSearcher } from './youtube-search'

const searcher = new YouTubeSearcher({
  apiKey: process.env.YOUTUBE_API_KEY,
})

const videoUrl = await searcher.findSong(
  'กระทบไหล่',  // title
  'เก่ง ธชย'     // artist
)
```

**Features**:
- Searches: "[title] [artist] official" or "[title] [artist] karaoke"
- Validates video availability
- Caches results to avoid duplicate API calls
- Rate limiting (50 requests/day default)

### `data-validator.ts`

Validates collected data against schema.

```typescript
import { validateSong } from './data-validator'

const result = validateSong({
  title: 'Song Title',
  artist: 'Artist Name',
  // ... other fields
})

if (!result.valid) {
  console.error('Validation errors:', result.errors)
}
```

**Validations**:
- Required fields present
- Data types correct
- YouTube URLs valid format
- No duplicates
- Lyrics snippet length ≤ 150 chars

### `csv-exporter.ts`

Exports to CSV format ready for database import.

```typescript
import { exportToCSV } from './csv-exporter'

await exportToCSV(songs, {
  output: 'songs.csv',
  includeHeaders: true,
})
```

**Output Format**:
```csv
id,title,artist,genre,year,tempo,language,dialect,lyrics_snippet,difficulty,tags,youtube_url
song_001,"กระทบไหล่","เก่ง ธชย","ลูกกรุง",2019,90,"Thai",,"กระทบไหล่ที่ผ่านมา...","Easy","โรแมนติก,ร้องง่าย,ฮิต","https://youtube.com/..."
```

---

## Curated Song Lists

### Thai Songs Sources

**ลูกทุ่ง (Thai Country)**:
- Spotify Playlist: "ลูกทุ่งฮิต"
- Search: "ลูกทุ่ง คาราโอเกะ"
- Manual: Top 20 classic ลูกทุ่ง songs

**ลูกกรุง (Thai Pop)**:
- Spotify Playlist: "Thai Pop Hits"
- Search: "ลูกกรุง 2023 2024"
- Manual: Chart-topping songs

**สตริง (String)**:
- Spotify Playlist: "สตริงเพราะๆ"
- Search: "สตริง คาราโอเกะ"

**หมอลำ (Mor Lam)**:
- Search: "หมอลำ อีสาน"
- Manual curation needed

### International Songs Sources

**K-pop**:
- Spotify Playlist: "K-pop Karaoke"
- Popular artists: BTS, BLACKPINK, NewJeans

**J-pop**:
- Spotify Playlist: "J-pop Hits"
- Anime songs popular in karaoke

**Western**:
- Spotify Playlist: "Karaoke Classics"
- Search: "karaoke popular songs"

---

## Data Quality Guidelines

### Song Selection Criteria

✅ **Include**:
- Popular songs (high Spotify popularity score)
- Songs with official YouTube videos
- Clear genre classification
- Available lyrics snippet
- Suitable for karaoke (not too complex)

❌ **Exclude**:
- Explicit content
- Very long songs (>6 minutes)
- Songs without YouTube videos
- Duplicate/cover versions
- Poor audio quality

### Metadata Requirements

**Required Fields**:
- `title` (string)
- `artist` (string)
- `genre` (string)
- `language` (Thai/English/Korean/Japanese/Chinese)
- `youtube_url` (valid URL)

**Recommended Fields**:
- `year` (integer)
- `tempo` (BPM, integer)
- `difficulty` (Easy/Medium/Hard)
- `tags` (array of strings)
- `lyrics_snippet` (string, max 150 chars)

**Optional Fields**:
- `dialect` (for Thai songs: Isaan/Southern/Central)
- `spotify_url`
- `deezer_url`

---

## Rate Limits & Best Practices

### Spotify API
- **Limit**: 10,000 requests/day
- **Best Practice**: Cache access tokens (valid for 1 hour)
- **Batch**: Request up to 50 songs per API call

### YouTube API
- **Limit**: 10,000 units/day
- **Cost**: Search = 100 units, Video = 1 unit
- **Best Practice**:
  - Cache search results
  - Limit to 50 searches/day during development
  - Use batch requests when possible

### Deezer API
- **Limit**: No official limit, but rate limiting exists
- **Best Practice**: Add 1 second delay between requests

---

## Ethical Guidelines

### ✅ DO

- Use official APIs only
- Respect rate limits
- Cache results to minimize requests
- Provide attribution
- Only use public data
- Respect robots.txt
- Follow Terms of Service

### ❌ DON'T

- Scrape copyrighted lyrics in full
- Bypass rate limits
- Store user-specific data without consent
- Sell or redistribute collected data
- Claim ownership of metadata
- Scrape without permission

---

## Example Workflow

### Collecting 100 Thai Songs

```bash
# 1. Collect from multiple sources
npm run collect:spotify -- \
  --search "ลูกทุ่ง" --limit 30 --output data/luk-thung.json

npm run collect:spotify -- \
  --search "ลูกกรุง" --limit 30 --output data/luk-krung.json

npm run collect:spotify -- \
  --search "สตริง" --limit 20 --output data/string.json

npm run collect:spotify -- \
  --search "หมอลำ" --limit 20 --output data/mor-lam.json

# 2. Merge all sources
npm run merge -- \
  --inputs "data/*.json" \
  --output data/thai-songs.json

# 3. Search YouTube links
npm run youtube:search -- \
  --input data/thai-songs.json \
  --output data/thai-with-youtube.json

# 4. Validate
npm run validate -- \
  --input data/thai-with-youtube.json

# 5. Manual review and cleanup
# Edit data/thai-with-youtube.json

# 6. Export to CSV
npm run export -- \
  --input data/thai-with-youtube.json \
  --output songs-thai.csv

# 7. Import to database
# Use Supabase dashboard or psql
```

---

## Troubleshooting

### "Spotify API authentication failed"
- Check API credentials in `config.ts`
- Verify app is not in development mode quota
- Regenerate client secret if needed

### "YouTube API quota exceeded"
- Limit: 10,000 units/day
- Wait 24 hours for quota reset
- Use cached results from previous runs
- Consider applying for quota increase

### "No YouTube videos found for song"
- Try manual search: `https://youtube.com/results?search_query=[title]+[artist]`
- Check spelling of title/artist
- Some songs may not have official videos

### "Validation errors"
- Check error messages in console
- Fix data in JSON file
- Re-run validation

---

## Output Files

### Directory Structure

```
scripts/data-collection/
├── data/
│   ├── raw/              # Raw API responses
│   ├── processed/        # Validated and cleaned
│   ├── cache/            # API response cache
│   └── export/           # Final CSV files
├── logs/                 # Collection logs
└── config.ts             # API credentials
```

### Files Generated

- `data/raw/spotify-*.json`: Raw Spotify responses
- `data/processed/songs.json`: Cleaned and validated data
- `data/export/songs.csv`: Final CSV for import
- `logs/collection-YYYY-MM-DD.log`: Collection logs

---

## Next Steps

After collecting 100-200 songs:

1. **Review Data Quality**
   - Check for missing YouTube links
   - Verify metadata accuracy
   - Test YouTube links manually

2. **Import to Database**
   ```bash
   # Use Supabase SQL Editor or CLI
   psql -h your-supabase-host -d postgres -f import-songs.sql
   ```

3. **Generate Embeddings**
   ```bash
   # Run embedding generation (separate script)
   npm run embeddings:generate -- --input data/export/songs.csv
   ```

4. **Test Search**
   ```bash
   # Test vector search
   npm run test:search -- --query "เพลงเศร้าๆ"
   ```

---

## Contributing

### Adding New Data Sources

1. Create new collector: `collectors/[source]-collector.ts`
2. Implement `DataCollector` interface
3. Add to `index.ts`
4. Update this README

### Improving Data Quality

1. Add validation rules in `data-validator.ts`
2. Add genre mappings
3. Improve YouTube search accuracy
4. Add data enrichment

---

## License & Attribution

**Data Sources**:
- Spotify: © Spotify AB
- YouTube: © Google LLC
- Deezer: © Deezer SA

**Usage**: Personal, educational, and non-commercial use only

**Attribution Required**: When using collected data, credit the original sources

---

## Support

**Issues**: Create an issue in the repository

**Questions**: Check documentation or ask in discussions

---

**Last Updated**: 2025-10-23
**Version**: 1.0
