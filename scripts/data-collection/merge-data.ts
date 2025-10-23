import type { Song } from './types'
import { log, readJSON, writeJSON, deduplicateSongs, ensureDir } from './utils'
import path from 'path'
import { glob } from 'glob'

/**
 * Merge options
 */
export interface MergeOptions {
  /**
   * How to handle duplicates (same title + artist)
   */
  duplicateStrategy?: 'first' | 'last' | 'merge'

  /**
   * Sort output by field
   */
  sortBy?: keyof Song

  /**
   * Sort order
   */
  sortOrder?: 'asc' | 'desc'

  /**
   * Filter by language
   */
  filterLanguage?: Song['language'][]

  /**
   * Minimum year
   */
  minYear?: number

  /**
   * Maximum year
   */
  maxYear?: number
}

/**
 * Merge multiple song JSON files
 */
export async function mergeSongFiles(
  inputPatterns: string[],
  outputPath: string,
  options: MergeOptions = {}
): Promise<Song[]> {
  const {
    duplicateStrategy = 'merge',
    sortBy,
    sortOrder = 'asc',
    filterLanguage,
    minYear,
    maxYear,
  } = options

  // Find all matching files
  const files: string[] = []
  for (const pattern of inputPatterns) {
    const matches = await glob(pattern)
    files.push(...matches)
  }

  if (files.length === 0) {
    throw new Error('No files found matching patterns')
  }

  log(`Found ${files.length} files to merge`)

  // Read all files
  const allSongs: Song[] = []
  for (const file of files) {
    log(`Reading: ${file}`)
    const songs = await readJSON<Song[]>(file)
    log(`  Loaded ${songs.length} songs`)
    allSongs.push(...songs)
  }

  log(`\nTotal songs before merge: ${allSongs.length}`)

  // Handle duplicates
  let merged: Song[]
  switch (duplicateStrategy) {
    case 'first':
      merged = deduplicateSongs(allSongs)
      break
    case 'last':
      merged = deduplicateSongs(allSongs.reverse()).reverse()
      break
    case 'merge':
      merged = mergeWithStrategy(allSongs)
      break
  }

  log(`After deduplication: ${merged.length} songs`)

  // Apply filters
  let filtered = merged

  if (filterLanguage && filterLanguage.length > 0) {
    filtered = filtered.filter((s) => filterLanguage.includes(s.language))
    log(`After language filter: ${filtered.length} songs`)
  }

  if (minYear !== undefined) {
    filtered = filtered.filter((s) => s.year && s.year >= minYear)
    log(`After min year filter: ${filtered.length} songs`)
  }

  if (maxYear !== undefined) {
    filtered = filtered.filter((s) => s.year && s.year <= maxYear)
    log(`After max year filter: ${filtered.length} songs`)
  }

  // Sort
  if (sortBy) {
    filtered.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]

      if (aVal === undefined || bVal === undefined) return 0

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })
    log(`Sorted by: ${sortBy} (${sortOrder})`)
  }

  // Save output
  await ensureDir(path.dirname(outputPath))
  await writeJSON(outputPath, filtered)

  log(`\n✓ Merged ${filtered.length} songs to: ${outputPath}`)

  return filtered
}

/**
 * Merge duplicates by combining their data
 */
function mergeWithStrategy(songs: Song[]): Song[] {
  const songMap = new Map<string, Song>()

  for (const song of songs) {
    const key = `${song.title.toLowerCase()}::${song.artist.toLowerCase()}`

    if (songMap.has(key)) {
      const existing = songMap.get(key)!
      const merged = mergeSongs(existing, song)
      songMap.set(key, merged)
    } else {
      songMap.set(key, song)
    }
  }

  return Array.from(songMap.values())
}

/**
 * Merge two song objects, preferring non-null values
 */
function mergeSongs(song1: Song, song2: Song): Song {
  return {
    id: song1.id, // Keep first ID
    title: song1.title,
    artist: song1.artist,
    genre: song1.genre || song2.genre,
    year: song1.year || song2.year,
    tempo: song1.tempo || song2.tempo,
    language: song1.language,
    dialect: song1.dialect || song2.dialect,
    lyricsSnippet: song1.lyricsSnippet || song2.lyricsSnippet,
    difficulty: song1.difficulty || song2.difficulty,
    tags: Array.from(new Set([...song1.tags, ...song2.tags])), // Merge tags
    youtubeUrl: song1.youtubeUrl || song2.youtubeUrl,
    spotifyUrl: song1.spotifyUrl || song2.spotifyUrl,
    deezerUrl: song1.deezerUrl || song2.deezerUrl,
  }
}

/**
 * Split large file into smaller chunks
 */
export async function splitSongFile(
  inputPath: string,
  outputDir: string,
  chunkSize = 100
): Promise<void> {
  log(`Reading: ${inputPath}`)
  const songs = await readJSON<Song[]>(inputPath)

  log(`Splitting ${songs.length} songs into chunks of ${chunkSize}...`)

  await ensureDir(outputDir)

  const chunks = Math.ceil(songs.length / chunkSize)

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, songs.length)
    const chunk = songs.slice(start, end)

    const outputPath = path.join(outputDir, `chunk-${i + 1}.json`)
    await writeJSON(outputPath, chunk)

    log(`  Chunk ${i + 1}/${chunks}: ${chunk.length} songs → ${outputPath}`)
  }

  log(`\n✓ Split into ${chunks} chunks`)
}

/**
 * Group songs by criteria
 */
export async function groupSongs(
  inputPath: string,
  outputDir: string,
  groupBy: 'language' | 'genre' | 'difficulty' | 'year'
): Promise<void> {
  log(`Reading: ${inputPath}`)
  const songs = await readJSON<Song[]>(inputPath)

  log(`Grouping ${songs.length} songs by ${groupBy}...`)

  await ensureDir(outputDir)

  const groups = new Map<string, Song[]>()

  for (const song of songs) {
    let key: string

    switch (groupBy) {
      case 'language':
        key = song.language
        break
      case 'genre':
        key = song.genre
        break
      case 'difficulty':
        key = song.difficulty || 'unknown'
        break
      case 'year':
        key = song.year ? song.year.toString() : 'unknown'
        break
    }

    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(song)
  }

  // Save each group
  for (const [key, groupSongs] of groups.entries()) {
    const filename = key.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const outputPath = path.join(outputDir, `${groupBy}-${filename}.json`)
    await writeJSON(outputPath, groupSongs)

    log(
      `  ${key}: ${groupSongs.length} songs → ${outputPath}`
    )
  }

  log(`\n✓ Created ${groups.size} groups`)
}

/**
 * Generate merge statistics
 */
export function generateMergeStats(songs: Song[]): {
  total: number
  byLanguage: Record<string, number>
  byGenre: Record<string, number>
  byYear: Record<string, number>
  completeness: {
    withYouTube: number
    withLyrics: number
    withTempo: number
    withDifficulty: number
  }
} {
  const stats = {
    total: songs.length,
    byLanguage: {} as Record<string, number>,
    byGenre: {} as Record<string, number>,
    byYear: {} as Record<string, number>,
    completeness: {
      withYouTube: songs.filter((s) => s.youtubeUrl).length,
      withLyrics: songs.filter((s) => s.lyricsSnippet).length,
      withTempo: songs.filter((s) => s.tempo).length,
      withDifficulty: songs.filter((s) => s.difficulty).length,
    },
  }

  songs.forEach((song) => {
    // Count by language
    stats.byLanguage[song.language] =
      (stats.byLanguage[song.language] || 0) + 1

    // Count by genre
    stats.byGenre[song.genre] = (stats.byGenre[song.genre] || 0) + 1

    // Count by year
    const yearKey = song.year ? song.year.toString() : 'unknown'
    stats.byYear[yearKey] = (stats.byYear[yearKey] || 0) + 1
  })

  return stats
}

/**
 * CLI usage
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const run = async () => {
    const args = process.argv.slice(2)
    const command = args[0]

    switch (command) {
      case 'merge': {
        const inputs =
          args.find((a) => a.startsWith('--inputs='))?.split('=')[1] || ''
        const output =
          args.find((a) => a.startsWith('--output='))?.split('=')[1] ||
          'data/merged.json'

        if (!inputs) {
          console.error('Usage: npm run merge -- merge --inputs="<patterns>" [--output=<file>]')
          console.error('')
          console.error('Example:')
          console.error('  npm run merge -- merge --inputs="data/*.json" --output=data/all.json')
          process.exit(1)
        }

        const patterns = inputs.split(',').map((p) => p.trim())
        const songs = await mergeSongFiles(patterns, output)

        // Show stats
        const stats = generateMergeStats(songs)
        console.log('\nMerge Statistics:')
        console.log(`  Total: ${stats.total}`)
        console.log(`  Languages: ${Object.keys(stats.byLanguage).length}`)
        console.log(`  Genres: ${Object.keys(stats.byGenre).length}`)
        console.log(
          `  Completeness: ${stats.completeness.withYouTube} YouTube, ${stats.completeness.withLyrics} lyrics`
        )
        break
      }

      case 'split': {
        const input = args.find((a) => a.startsWith('--input='))?.split('=')[1]
        const outputDir =
          args.find((a) => a.startsWith('--output='))?.split('=')[1] ||
          'data/chunks'
        const chunkSize = parseInt(
          args.find((a) => a.startsWith('--size='))?.split('=')[1] || '100'
        )

        if (!input) {
          console.error('Usage: npm run merge -- split --input=<file> [--output=<dir>] [--size=<n>]')
          process.exit(1)
        }

        await splitSongFile(input, outputDir, chunkSize)
        break
      }

      case 'group': {
        const input = args.find((a) => a.startsWith('--input='))?.split('=')[1]
        const outputDir =
          args.find((a) => a.startsWith('--output='))?.split('=')[1] ||
          'data/grouped'
        const groupBy = args
          .find((a) => a.startsWith('--by='))
          ?.split('=')[1] as 'language' | 'genre' | 'difficulty' | 'year'

        if (!input || !groupBy) {
          console.error('Usage: npm run merge -- group --input=<file> --by=<field> [--output=<dir>]')
          console.error('')
          console.error('Fields: language, genre, difficulty, year')
          process.exit(1)
        }

        await groupSongs(input, outputDir, groupBy)
        break
      }

      default:
        console.error('Usage: npm run merge -- <command> [options]')
        console.error('')
        console.error('Commands:')
        console.error('  merge   Merge multiple JSON files')
        console.error('  split   Split large file into chunks')
        console.error('  group   Group songs by criteria')
        process.exit(1)
    }
  }

  run().catch(console.error)
}
