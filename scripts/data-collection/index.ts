#!/usr/bin/env tsx

import { SpotifyCollector } from './collectors/spotify-collector'
import { YouTubeSearcher } from './youtube-search'
import { validateSongs, printValidationReport, filterValidSongs } from './data-validator'
import { exportToCSV, generateExportReport } from './csv-exporter'
import { mergeSongFiles } from './merge-data'
import { config } from './config'
import { log, ensureDir, writeJSON, ProgressBar } from './utils'
import type { Song } from './types'
import path from 'path'

/**
 * Collection presets for Thai song genres
 */
const THAI_PRESETS = {
  'ลูกทุ่ง': {
    queries: ['ลูกทุ่ง คาราโอเกะ', 'ลูกทุ่ง ฮิต', 'ลูกทุ่ง เพราะๆ'],
    count: 30,
  },
  'ลูกกรุง': {
    queries: ['ลูกกรุง', 'ลูกกรุง ฮิต', 'Thai Pop'],
    count: 30,
  },
  สตริง: {
    queries: ['สตริง เพราะๆ', 'สตริง คาราโอเกะ'],
    count: 20,
  },
  หมอลำ: {
    queries: ['หมอลำ', 'หมอลำ อีสาน', 'มอลำ'],
    count: 15,
  },
  เพลงใต้: {
    queries: ['เพลงใต้', 'เพลงใต้ คาราโอเกะ'],
    count: 10,
  },
  เพลงเพื่อชีวิต: {
    queries: ['เพลงเพื่อชีวิต', 'คาราวาน', 'ปาน ธนพร'],
    count: 15,
  },
}

/**
 * Collection presets for international songs
 */
const INTERNATIONAL_PRESETS = {
  kpop: {
    queries: ['K-pop karaoke', 'BTS', 'BLACKPINK', 'NewJeans'],
    count: 30,
  },
  jpop: {
    queries: ['J-pop karaoke', 'Japanese anime songs karaoke'],
    count: 20,
  },
  cpop: {
    queries: ['C-pop karaoke', 'Mandarin pop karaoke'],
    count: 20,
  },
  western: {
    queries: ['karaoke classics', 'popular karaoke songs'],
    count: 30,
  },
}

/**
 * Main collection workflow
 */
async function collect(options: {
  type?: 'thai' | 'international' | 'mixed'
  count?: number
  output?: string
}) {
  const { type = 'mixed', count = 100, output = 'data/collected.json' } = options

  log('='.repeat(60))
  log('KARAOKE AI - DATA COLLECTION')
  log('='.repeat(60))
  log(`Type: ${type}`)
  log(`Target count: ${count}`)
  log(`Output: ${output}`)
  log('')

  // Prepare directories
  await ensureDir('data/raw')
  await ensureDir('data/processed')
  await ensureDir('data/cache')

  // Initialize collectors
  log('Initializing collectors...')
  const spotifyCollector = new SpotifyCollector(
    config.spotify.clientId,
    config.spotify.clientSecret
  )
  const youtubeSearcher = new YouTubeSearcher(config.youtube.apiKey)

  // Collect songs from Spotify
  let allSongs: Song[] = []

  if (type === 'thai' || type === 'mixed') {
    log('\n📀 Collecting Thai songs...')
    const thaiCount = type === 'mixed' ? Math.floor(count * 0.6) : count

    for (const [genre, preset] of Object.entries(THAI_PRESETS)) {
      const genreCount = Math.floor(
        (preset.count / 120) * thaiCount // Proportional to preset count
      )

      log(`\n  Genre: ${genre} (target: ${genreCount})`)

      for (const query of preset.queries) {
        try {
          log(`    Searching: "${query}"`)
          const songs = await spotifyCollector.collect(query, genreCount)
          allSongs.push(...songs)
          log(`    ✓ Found: ${songs.length} songs`)

          // Rate limiting
          await new Promise((resolve) =>
            setTimeout(resolve, config.collection.rateLimits.spotify)
          )
        } catch (error) {
          log(`    ✗ Error: ${error}`, 'error')
        }

        // Stop if we have enough
        if (allSongs.length >= thaiCount) break
      }

      if (allSongs.length >= thaiCount) break
    }
  }

  if (type === 'international' || type === 'mixed') {
    log('\n🌍 Collecting International songs...')
    const intlCount = type === 'mixed' ? Math.floor(count * 0.4) : count

    for (const [genre, preset] of Object.entries(INTERNATIONAL_PRESETS)) {
      const genreCount = Math.floor(
        (preset.count / 100) * intlCount // Proportional
      )

      log(`\n  Genre: ${genre} (target: ${genreCount})`)

      for (const query of preset.queries) {
        try {
          log(`    Searching: "${query}"`)
          const songs = await spotifyCollector.collect(query, genreCount)
          allSongs.push(...songs)
          log(`    ✓ Found: ${songs.length} songs`)

          await new Promise((resolve) =>
            setTimeout(resolve, config.collection.rateLimits.spotify)
          )
        } catch (error) {
          log(`    ✗ Error: ${error}`, 'error')
        }

        if (allSongs.length >= count) break
      }

      if (allSongs.length >= count) break
    }
  }

  log(`\n✓ Collected ${allSongs.length} songs from Spotify`)

  // Save raw data
  const rawPath = 'data/raw/spotify-raw.json'
  await writeJSON(rawPath, allSongs)
  log(`✓ Saved raw data: ${rawPath}`)

  // Search YouTube links
  log('\n🎥 Searching YouTube links...')
  const songsWithYouTube = await youtubeSearcher.processSongs(allSongs)

  // Save with YouTube
  const withYouTubePath = 'data/processed/with-youtube.json'
  await writeJSON(withYouTubePath, songsWithYouTube)
  log(`✓ Saved: ${withYouTubePath}`)

  // Validate
  log('\n✓ Validating...')
  const validationResult = validateSongs(songsWithYouTube)
  printValidationReport(validationResult)

  // Filter valid songs
  const validSongs = filterValidSongs(songsWithYouTube, validationResult)

  // Save final output
  await writeJSON(output, validSongs)
  log(`\n✓ Saved ${validSongs.length} valid songs to: ${output}`)

  // Summary
  log('\n' + '='.repeat(60))
  log('COLLECTION COMPLETE')
  log('='.repeat(60))
  log(`Total collected: ${allSongs.length}`)
  log(`Valid songs: ${validSongs.length}`)
  log(`With YouTube: ${validSongs.filter((s) => s.youtubeUrl).length}`)
  log(`With lyrics: ${validSongs.filter((s) => s.lyricsSnippet).length}`)
  log('')
  log('Next steps:')
  log(`  1. Review: cat ${output}`)
  log(`  2. Export CSV: npm run export -- --input=${output}`)
  log(`  3. Import to database`)
  log('='.repeat(60))
}

/**
 * Quick start presets
 */
async function quickStart(preset: string) {
  switch (preset) {
    case 'thai-50':
      await collect({ type: 'thai', count: 50, output: 'data/thai-50.json' })
      break

    case 'thai-100':
      await collect({ type: 'thai', count: 100, output: 'data/thai-100.json' })
      break

    case 'international-50':
      await collect({
        type: 'international',
        count: 50,
        output: 'data/international-50.json',
      })
      break

    case 'mixed-100':
      await collect({ type: 'mixed', count: 100, output: 'data/mixed-100.json' })
      break

    case 'mixed-200':
      await collect({ type: 'mixed', count: 200, output: 'data/mixed-200.json' })
      break

    default:
      console.error(`Unknown preset: ${preset}`)
      console.error('Available presets: thai-50, thai-100, international-50, mixed-100, mixed-200')
      process.exit(1)
  }
}

/**
 * Full workflow: collect, validate, export
 */
async function fullWorkflow() {
  log('Starting full workflow: Collect → Validate → Export')
  log('')

  // Step 1: Collect
  log('STEP 1: Collection')
  await collect({ type: 'mixed', count: 200, output: 'data/collected.json' })

  // Step 2: Already validated during collection

  // Step 3: Export
  log('\nSTEP 2: Export to CSV')
  const { readJSON } = await import('./utils')
  const songs = await readJSON<Song[]>('data/collected.json')

  await ensureDir('data/export')
  await exportToCSV(songs, 'data/export/songs.csv')
  await generateExportReport(songs, 'data/export')

  log('\n✓ Full workflow complete!')
  log('Files generated:')
  log('  - data/collected.json (source data)')
  log('  - data/export/songs.csv (for database import)')
  log('  - data/export/export-report.md (statistics)')
}

/**
 * CLI entry point
 */
async function main() {
  const args = process.argv.slice(2)

  // No args - show help
  if (args.length === 0) {
    console.log('Karaoke AI - Data Collection Scripts')
    console.log('')
    console.log('Usage:')
    console.log('  npm run collect                    Interactive mode')
    console.log('  npm run collect -- --preset=<name> Quick start with preset')
    console.log('  npm run collect -- --full          Full workflow')
    console.log('  npm run collect -- [options]       Custom collection')
    console.log('')
    console.log('Presets:')
    console.log('  thai-50          50 Thai songs')
    console.log('  thai-100         100 Thai songs')
    console.log('  international-50 50 International songs')
    console.log('  mixed-100        100 Mixed songs (60% Thai, 40% Intl)')
    console.log('  mixed-200        200 Mixed songs (Phase 1 target)')
    console.log('')
    console.log('Options:')
    console.log('  --type=<type>    Collection type: thai, international, mixed')
    console.log('  --count=<n>      Number of songs to collect')
    console.log('  --output=<file>  Output JSON file')
    console.log('')
    console.log('Examples:')
    console.log('  npm run collect -- --preset=mixed-200')
    console.log('  npm run collect -- --type=thai --count=50')
    console.log('  npm run collect -- --full')
    console.log('')
    console.log('Individual scripts:')
    console.log('  npm run collect:spotify -- --search="ลูกทุ่ง" --limit=30')
    console.log('  npm run youtube:search -- --input=data/songs.json')
    console.log('  npm run validate -- --input=data/songs.json')
    console.log('  npm run export -- --input=data/songs.json --format=csv')
    console.log('')
    return
  }

  // Parse arguments
  const preset = args.find((a) => a.startsWith('--preset='))?.split('=')[1]
  const full = args.includes('--full')
  const type = args.find((a) => a.startsWith('--type='))?.split('=')[1] as
    | 'thai'
    | 'international'
    | 'mixed'
    | undefined
  const count = parseInt(
    args.find((a) => a.startsWith('--count='))?.split('=')[1] || '100'
  )
  const output = args.find((a) => a.startsWith('--output='))?.split('=')[1]

  try {
    if (preset) {
      await quickStart(preset)
    } else if (full) {
      await fullWorkflow()
    } else {
      await collect({ type, count, output })
    }
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { collect, quickStart, fullWorkflow }
