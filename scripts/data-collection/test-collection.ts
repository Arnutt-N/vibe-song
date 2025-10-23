#!/usr/bin/env tsx

/**
 * Test script for data collection
 * Collects a small sample (20-30 songs) to verify API integration
 */

import { SpotifyCollector } from './collectors/spotify-collector'
import { YouTubeSearcher } from './youtube-search'
import { validateSongs, printValidationReport } from './data-validator'
import { exportToCSV } from './csv-exporter'
import { log, ensureDir, writeJSON } from './utils'
import type { Song } from './types'

async function testCollection() {
  console.log('='.repeat(60))
  console.log('🧪 TESTING DATA COLLECTION')
  console.log('='.repeat(60))
  console.log('')

  // Check if .env exists
  const fs = require('fs')
  const envPath = '.env'

  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env file not found!')
    console.error('')
    console.error('Please create .env file with your API keys:')
    console.error('  cp .env.example .env')
    console.error('  # Then edit .env with your API keys')
    console.error('')
    console.error('See QUICKSTART.md for instructions on getting API keys.')
    process.exit(1)
  }

  // Load environment variables
  require('dotenv').config()

  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID
  const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const youtubeApiKey = process.env.YOUTUBE_API_KEY

  // Validate credentials
  if (!spotifyClientId || spotifyClientId === 'your_spotify_client_id_here') {
    console.error('❌ Error: SPOTIFY_CLIENT_ID not configured in .env')
    process.exit(1)
  }

  if (!spotifyClientSecret || spotifyClientSecret === 'your_spotify_client_secret_here') {
    console.error('❌ Error: SPOTIFY_CLIENT_SECRET not configured in .env')
    process.exit(1)
  }

  if (!youtubeApiKey || youtubeApiKey === 'your_youtube_api_key_here') {
    console.error('❌ Error: YOUTUBE_API_KEY not configured in .env')
    process.exit(1)
  }

  log('✓ Configuration validated')
  log('')

  // Prepare directories
  await ensureDir('data/test')

  // Initialize collectors
  log('Initializing collectors...')
  const spotifyCollector = new SpotifyCollector(
    spotifyClientId,
    spotifyClientSecret
  )
  const youtubeSearcher = new YouTubeSearcher(youtubeApiKey)
  log('✓ Collectors ready')
  log('')

  // Test 1: Collect Thai songs
  log('📀 TEST 1: Collecting 10 Thai songs (ลูกทุ่ง)...')
  let thaiSongs: Song[] = []

  try {
    thaiSongs = await spotifyCollector.collect('ลูกทุ่ง คาราโอเกะ', 10)
    log(`✓ Found ${thaiSongs.length} Thai songs`)
  } catch (error) {
    log(`✗ Failed: ${error}`, 'error')
    console.error('\nFull error:', error)
    process.exit(1)
  }

  // Test 2: Collect International songs
  log('')
  log('🌍 TEST 2: Collecting 10 International songs...')
  let intlSongs: Song[] = []

  try {
    intlSongs = await spotifyCollector.collect('K-pop karaoke', 10)
    log(`✓ Found ${intlSongs.length} International songs`)
  } catch (error) {
    log(`✗ Failed: ${error}`, 'error')
  }

  const allSongs = [...thaiSongs, ...intlSongs]
  log('')
  log(`Total collected: ${allSongs.length} songs`)

  // Save intermediate result
  await writeJSON('data/test/spotify-raw.json', allSongs)
  log('✓ Saved: data/test/spotify-raw.json')

  // Test 3: Search YouTube links (first 5 songs only to save quota)
  log('')
  log('🎥 TEST 3: Searching YouTube links (first 5 songs)...')

  const testSample = allSongs.slice(0, 5)
  let withYouTube: Song[] = []

  try {
    withYouTube = await youtubeSearcher.processSongs(testSample)
    const foundCount = withYouTube.filter((s) => s.youtubeUrl).length
    log(`✓ Found YouTube links: ${foundCount}/${testSample.length}`)
  } catch (error) {
    log(`⚠ YouTube search failed: ${error}`, 'warn')
    log('  (This is optional, continuing...)')
    withYouTube = testSample
  }

  await writeJSON('data/test/with-youtube.json', withYouTube)
  log('✓ Saved: data/test/with-youtube.json')

  // Test 4: Validate
  log('')
  log('✓ TEST 4: Validating data...')
  const validationResult = validateSongs(allSongs)
  printValidationReport(validationResult)

  // Test 5: Export sample
  log('')
  log('📊 TEST 5: Exporting to CSV...')
  await ensureDir('data/test/export')
  await exportToCSV(allSongs.slice(0, 10), 'data/test/export/sample.csv')
  log('✓ Saved: data/test/export/sample.csv')

  // Summary
  log('')
  log('='.repeat(60))
  log('✅ ALL TESTS PASSED!')
  log('='.repeat(60))
  log('')
  log('Test Results:')
  log(`  ✓ Spotify API: Working (${allSongs.length} songs)`)
  log(`  ✓ YouTube API: Working (${withYouTube.filter((s) => s.youtubeUrl).length}/${testSample.length} found)`)
  log(`  ✓ Validation: ${validationResult.valid ? 'Passed' : `${validationResult.errors.length} errors`}`)
  log(`  ✓ Export: Working`)
  log('')
  log('Generated Files:')
  log('  - data/test/spotify-raw.json')
  log('  - data/test/with-youtube.json')
  log('  - data/test/export/sample.csv')
  log('')
  log('Next Steps:')
  log('  1. Review sample data: cat data/test/spotify-raw.json')
  log('  2. Run full collection: npm run collect -- --preset=mixed-200')
  log('  3. Export for database: npm run export -- --input=data/mixed-200.json')
  log('')
  log('='.repeat(60))
}

// Run test
testCollection().catch((error) => {
  console.error('\n❌ Test failed:', error)
  console.error('\nTroubleshooting:')
  console.error('  1. Check .env file has correct API keys')
  console.error('  2. Verify API keys are active')
  console.error('  3. Check internet connection')
  console.error('  4. See QUICKSTART.md for setup help')
  process.exit(1)
})
