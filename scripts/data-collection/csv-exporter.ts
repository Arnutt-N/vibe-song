import { createObjectCsvWriter } from 'csv-writer'
import type { Song } from './types'
import { log, readJSON, ensureDir, getFileSize, countLines } from './utils'
import path from 'path'

/**
 * Export songs to CSV format
 */
export async function exportToCSV(
  songs: Song[],
  outputPath: string,
  options: ExportOptions = {}
): Promise<void> {
  const {
    includeHeaders = true,
    delimiter = ',',
    encoding = 'utf-8',
  } = options

  // Prepare output directory
  await ensureDir(path.dirname(outputPath))

  // Create CSV writer
  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'id', title: 'id' },
      { id: 'title', title: 'title' },
      { id: 'artist', title: 'artist' },
      { id: 'genre', title: 'genre' },
      { id: 'year', title: 'year' },
      { id: 'tempo', title: 'tempo' },
      { id: 'language', title: 'language' },
      { id: 'dialect', title: 'dialect' },
      { id: 'lyricsSnippet', title: 'lyrics_snippet' },
      { id: 'difficulty', title: 'difficulty' },
      { id: 'tags', title: 'tags' },
      { id: 'youtubeUrl', title: 'youtube_url' },
      { id: 'spotifyUrl', title: 'spotify_url' },
      { id: 'deezerUrl', title: 'deezer_url' },
    ],
    fieldDelimiter: delimiter,
    encoding,
  })

  // Convert songs to CSV-friendly format
  const records = songs.map((song) => ({
    id: song.id,
    title: escapeCSVField(song.title),
    artist: escapeCSVField(song.artist),
    genre: escapeCSVField(song.genre),
    year: song.year || '',
    tempo: song.tempo || '',
    language: song.language,
    dialect: song.dialect || '',
    lyricsSnippet: song.lyricsSnippet
      ? escapeCSVField(song.lyricsSnippet)
      : '',
    difficulty: song.difficulty || '',
    tags: song.tags.map((t) => escapeCSVField(t)).join('|'), // Pipe-separated
    youtubeUrl: song.youtubeUrl || '',
    spotifyUrl: song.spotifyUrl || '',
    deezerUrl: song.deezerUrl || '',
  }))

  // Write to CSV
  await csvWriter.writeRecords(records)

  log(`✓ Exported ${songs.length} songs to: ${outputPath}`)
}

/**
 * Export options
 */
export interface ExportOptions {
  includeHeaders?: boolean
  delimiter?: string
  encoding?: BufferEncoding
}

/**
 * Escape special characters in CSV fields
 */
function escapeCSVField(value: string): string {
  // Replace newlines with spaces
  let escaped = value.replace(/\n/g, ' ').replace(/\r/g, '')

  // Replace multiple spaces with single space
  escaped = escaped.replace(/\s+/g, ' ')

  // Trim
  escaped = escaped.trim()

  // Escape quotes
  if (escaped.includes('"')) {
    escaped = escaped.replace(/"/g, '""')
  }

  // Wrap in quotes if contains comma, quote, or newline
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    escaped = `"${escaped}"`
  }

  return escaped
}

/**
 * Export to SQL INSERT statements
 */
export async function exportToSQL(
  songs: Song[],
  outputPath: string,
  tableName = 'songs'
): Promise<void> {
  await ensureDir(path.dirname(outputPath))

  const lines: string[] = []

  // Header
  lines.push('-- Song data import')
  lines.push(`-- Generated: ${new Date().toISOString()}`)
  lines.push(`-- Total songs: ${songs.length}`)
  lines.push('')

  // Insert statements (batched)
  const batchSize = 100
  for (let i = 0; i < songs.length; i += batchSize) {
    const batch = songs.slice(i, i + batchSize)

    lines.push(
      `INSERT INTO ${tableName} (id, title, artist, genre, year, tempo, language, dialect, lyrics_snippet, difficulty, tags, youtube_url, spotify_url, deezer_url)`
    )
    lines.push('VALUES')

    batch.forEach((song, idx) => {
      const values = [
        sqlString(song.id),
        sqlString(song.title),
        sqlString(song.artist),
        sqlString(song.genre),
        song.year || 'NULL',
        song.tempo || 'NULL',
        sqlString(song.language),
        song.dialect ? sqlString(song.dialect) : 'NULL',
        song.lyricsSnippet ? sqlString(song.lyricsSnippet) : 'NULL',
        song.difficulty ? sqlString(song.difficulty) : 'NULL',
        sqlArray(song.tags),
        song.youtubeUrl ? sqlString(song.youtubeUrl) : 'NULL',
        song.spotifyUrl ? sqlString(song.spotifyUrl) : 'NULL',
        song.deezerUrl ? sqlString(song.deezerUrl) : 'NULL',
      ]

      const isLast = idx === batch.length - 1 && i + batchSize >= songs.length
      lines.push(`  (${values.join(', ')})${isLast ? ';' : ','}`)
    })

    lines.push('')
  }

  // Write to file
  const fs = await import('fs/promises')
  await fs.writeFile(outputPath, lines.join('\n'), 'utf-8')

  log(`✓ Exported ${songs.length} songs to SQL: ${outputPath}`)
}

/**
 * Escape SQL string
 */
function sqlString(value: string): string {
  const escaped = value.replace(/'/g, "''").replace(/\\/g, '\\\\')
  return `'${escaped}'`
}

/**
 * Convert array to PostgreSQL array
 */
function sqlArray(values: string[]): string {
  if (values.length === 0) return "ARRAY[]::text[]"
  const escaped = values.map((v) => sqlString(v))
  return `ARRAY[${escaped.join(', ')}]`
}

/**
 * Export to JSON Lines (one song per line)
 */
export async function exportToJSONL(
  songs: Song[],
  outputPath: string
): Promise<void> {
  await ensureDir(path.dirname(outputPath))

  const lines = songs.map((song) => JSON.stringify(song))

  const fs = await import('fs/promises')
  await fs.writeFile(outputPath, lines.join('\n'), 'utf-8')

  log(`✓ Exported ${songs.length} songs to JSONL: ${outputPath}`)
}

/**
 * Generate export report
 */
export async function generateExportReport(
  songs: Song[],
  outputDir: string
): Promise<void> {
  const stats = {
    total: songs.length,
    byLanguage: {} as Record<string, number>,
    byGenre: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    withYouTube: songs.filter((s) => s.youtubeUrl).length,
    withLyrics: songs.filter((s) => s.lyricsSnippet).length,
    withSpotify: songs.filter((s) => s.spotifyUrl).length,
    avgYear:
      songs.filter((s) => s.year).reduce((sum, s) => sum + s.year!, 0) /
      songs.filter((s) => s.year).length,
    avgTempo:
      songs.filter((s) => s.tempo).reduce((sum, s) => sum + s.tempo!, 0) /
      songs.filter((s) => s.tempo).length,
  }

  // Count by language
  songs.forEach((song) => {
    stats.byLanguage[song.language] =
      (stats.byLanguage[song.language] || 0) + 1
  })

  // Count by genre
  songs.forEach((song) => {
    stats.byGenre[song.genre] = (stats.byGenre[song.genre] || 0) + 1
  })

  // Count by difficulty
  songs.forEach((song) => {
    if (song.difficulty) {
      stats.byDifficulty[song.difficulty] =
        (stats.byDifficulty[song.difficulty] || 0) + 1
    }
  })

  const report: string[] = []

  report.push('# Data Export Report')
  report.push('')
  report.push(`**Generated**: ${new Date().toISOString()}`)
  report.push(`**Total Songs**: ${stats.total}`)
  report.push('')

  report.push('## Overview')
  report.push('')
  report.push(`- Songs with YouTube: ${stats.withYouTube} (${((stats.withYouTube / stats.total) * 100).toFixed(1)}%)`)
  report.push(`- Songs with Lyrics: ${stats.withLyrics} (${((stats.withLyrics / stats.total) * 100).toFixed(1)}%)`)
  report.push(`- Songs with Spotify: ${stats.withSpotify} (${((stats.withSpotify / stats.total) * 100).toFixed(1)}%)`)
  report.push(`- Average Year: ${stats.avgYear.toFixed(0)}`)
  report.push(`- Average Tempo: ${stats.avgTempo.toFixed(0)} BPM`)
  report.push('')

  report.push('## By Language')
  report.push('')
  Object.entries(stats.byLanguage)
    .sort((a, b) => b[1] - a[1])
    .forEach(([lang, count]) => {
      report.push(`- ${lang}: ${count} (${((count / stats.total) * 100).toFixed(1)}%)`)
    })
  report.push('')

  report.push('## By Genre')
  report.push('')
  Object.entries(stats.byGenre)
    .sort((a, b) => b[1] - a[1])
    .forEach(([genre, count]) => {
      report.push(`- ${genre}: ${count} (${((count / stats.total) * 100).toFixed(1)}%)`)
    })
  report.push('')

  report.push('## By Difficulty')
  report.push('')
  Object.entries(stats.byDifficulty)
    .sort((a, b) => b[1] - a[1])
    .forEach(([diff, count]) => {
      report.push(`- ${diff}: ${count} (${((count / stats.total) * 100).toFixed(1)}%)`)
    })
  report.push('')

  const reportPath = path.join(outputDir, 'export-report.md')
  const fs = await import('fs/promises')
  await fs.writeFile(reportPath, report.join('\n'), 'utf-8')

  log(`✓ Generated export report: ${reportPath}`)
}

/**
 * CLI usage
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const run = async () => {
    const args = process.argv.slice(2)
    const inputFile = args.find((a) => a.startsWith('--input='))?.split('=')[1]
    const outputFile =
      args.find((a) => a.startsWith('--output='))?.split('=')[1] ||
      'data/export/songs.csv'
    const format =
      args.find((a) => a.startsWith('--format='))?.split('=')[1] || 'csv'

    if (!inputFile) {
      console.error('Usage: npm run export -- --input=<file> [options]')
      console.error('')
      console.error('Options:')
      console.error('  --input=<file>     Input JSON file')
      console.error('  --output=<file>    Output file (default: data/export/songs.csv)')
      console.error('  --format=<format>  Output format: csv, sql, jsonl (default: csv)')
      process.exit(1)
    }

    log(`Reading: ${inputFile}`)
    const songs = await readJSON<Song[]>(inputFile)

    log(`Exporting ${songs.length} songs...`)

    switch (format) {
      case 'csv':
        await exportToCSV(songs, outputFile)
        break
      case 'sql':
        await exportToSQL(songs, outputFile)
        break
      case 'jsonl':
        await exportToJSONL(songs, outputFile)
        break
      default:
        console.error(`Unknown format: ${format}`)
        process.exit(1)
    }

    // Generate report
    await generateExportReport(songs, path.dirname(outputFile))

    // Show file info
    const fileSize = await getFileSize(outputFile)
    const lineCount = await countLines(outputFile)

    log(`\nFile info:`)
    log(`  Size: ${fileSize}`)
    log(`  Lines: ${lineCount}`)
    log(`\n✓ Export complete!`)
  }

  run().catch(console.error)
}
