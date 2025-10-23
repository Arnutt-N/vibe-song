# Quick Start Guide

Get started with Karaoke AI data collection in 5 minutes.

---

## Prerequisites

### 1. Get API Keys (Free)

#### Spotify API
1. Go to https://developer.spotify.com/dashboard
2. Click "Create app"
3. Fill in:
   - App name: "Karaoke AI Data Collection"
   - App description: "Collecting song metadata"
   - Redirect URI: `http://localhost` (required, won't be used)
   - Check "Web API"
4. Click "Save"
5. Copy **Client ID** and **Client Secret**

#### YouTube Data API v3
1. Go to https://console.cloud.google.com
2. Create new project: "Karaoke AI"
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy the **API Key**

---

## Installation

```bash
cd scripts/data-collection

# Install dependencies
npm install
```

---

## Configuration

### Option 1: Environment Variables (Recommended)

```bash
# Create .env file
cat > .env <<EOF
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
YOUTUBE_API_KEY=your_youtube_api_key_here
EOF
```

### Option 2: Config File

```bash
# Copy config template
cp config.example.ts config.ts

# Edit config.ts and replace:
# - YOUR_SPOTIFY_CLIENT_ID
# - YOUR_SPOTIFY_CLIENT_SECRET
# - YOUR_YOUTUBE_API_KEY
```

---

## Quick Commands

### Collect 200 Mixed Songs (Thai + International)

```bash
npm run collect -- --preset=mixed-200
```

Output: `data/mixed-200.json`

### Collect 100 Thai Songs Only

```bash
npm run collect -- --preset=thai-100
```

Output: `data/thai-100.json`

### Collect 50 International Songs

```bash
npm run collect -- --preset=international-50
```

Output: `data/international-50.json`

---

## Step-by-Step Workflow

### 1. Collect from Spotify

```bash
npm run collect:spotify -- \
  --search "ลูกทุ่ง คาราโอเกะ" \
  --limit 30 \
  --output data/luk-thung.json
```

### 2. Find YouTube Links

```bash
npm run youtube:search -- \
  --input data/luk-thung.json \
  --output data/luk-thung-youtube.json
```

### 3. Validate Data

```bash
npm run validate -- \
  --input data/luk-thung-youtube.json
```

### 4. Export to CSV

```bash
npm run export -- \
  --input data/luk-thung-youtube.json \
  --output data/export/songs.csv
```

---

## Common Tasks

### Merge Multiple Files

```bash
npm run merge -- merge \
  --inputs="data/*.json" \
  --output=data/all-songs.json
```

### Split Large File

```bash
npm run merge -- split \
  --input=data/all-songs.json \
  --output=data/chunks \
  --size=50
```

### Group by Language

```bash
npm run merge -- group \
  --input=data/all-songs.json \
  --by=language \
  --output=data/grouped
```

---

## Expected Output

### After Collection

```
data/
├── mixed-200.json          # 200 songs with metadata
├── raw/
│   └── spotify-raw.json    # Raw Spotify data
├── processed/
│   └── with-youtube.json   # After YouTube search
└── cache/
    ├── spotify-cache.json  # Spotify cache
    └── youtube-cache.json  # YouTube cache
```

### After Export

```
data/export/
├── songs.csv              # CSV for database import
└── export-report.md       # Statistics report
```

---

## Troubleshooting

### "Spotify API authentication failed"

Check your credentials in `config.ts` or `.env`:
```bash
echo $SPOTIFY_CLIENT_ID
echo $SPOTIFY_CLIENT_SECRET
```

### "YouTube API quota exceeded"

- Free tier: 10,000 units/day
- Each search: ~100 units
- Wait 24 hours or reduce quota limit in `config.ts`:
  ```typescript
  youtube: {
    quotaLimit: 20,  // Reduce from 50
  }
  ```

### "No songs found"

Try different search queries:
```bash
# Thai
npm run collect:spotify -- --search "เพลงไทย ฮิต"
npm run collect:spotify -- --search "ลูกกรุง"

# International
npm run collect:spotify -- --search "K-pop karaoke"
npm run collect:spotify -- --search "popular karaoke songs"
```

### "Module not found"

```bash
npm install
```

---

## Next Steps

After collecting songs:

1. **Import to Database**
   ```sql
   -- Use Supabase SQL Editor
   COPY songs FROM '/path/to/songs.csv' DELIMITER ',' CSV HEADER;
   ```

2. **Generate Embeddings**
   ```bash
   # Coming soon: embedding generation script
   npm run embeddings:generate -- --input data/export/songs.csv
   ```

3. **Test Search**
   ```bash
   # Coming soon: search testing
   npm run test:search -- --query "เพลงเศร้าๆ"
   ```

---

## Tips

### Cache Usage

The scripts cache API responses automatically:
- Spotify searches cached 24 hours
- YouTube links cached permanently
- Reduces API calls on re-runs

### Rate Limiting

Configured in `config.ts`:
```typescript
rateLimits: {
  spotify: 100,  // 100ms between requests
  youtube: 1000, // 1 second between requests
}
```

Increase delays if you get rate limit errors:
```typescript
rateLimits: {
  spotify: 500,  // 500ms
  youtube: 2000, // 2 seconds
}
```

### Quality Filters

Adjust in `config.ts`:
```typescript
quality: {
  minPopularity: 30,     // Minimum Spotify popularity (0-100)
  maxDuration: 360,      // Max 6 minutes
  requireYouTube: true,  // Only export songs with YouTube links
  excludeExplicit: true, // Exclude explicit content
}
```

---

## Example: Collect Phase 1 MVP Dataset

Collect 200 songs (120 Thai + 80 International) for Phase 1:

```bash
# Full automated workflow
npm run collect -- --full

# Or step-by-step
npm run collect -- --preset=mixed-200
npm run export -- --input=data/mixed-200.json --format=csv
```

Expected results:
- 200 songs total
- 180+ with YouTube links (90%+)
- 160+ with lyrics snippets (80%+)
- CSV ready for database import

---

## Support

**Issues**: Check README.md troubleshooting section

**Questions**: Review detailed documentation in README.md

**API Limits**: Monitor usage in console output:
```
YouTube API calls: 45/50
Spotify requests: 120
```

---

**Last Updated**: 2025-10-23
**Version**: 1.0
