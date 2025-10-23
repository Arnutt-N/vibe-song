import { z } from 'zod'
import type { Song } from './types'
import { SongSchema } from './types'
import { log, readJSON } from './utils'

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  stats: ValidationStats
}

export interface ValidationError {
  index: number
  songId: string
  field: string
  message: string
  value?: unknown
}

export interface ValidationWarning {
  index: number
  songId: string
  field: string
  message: string
  value?: unknown
}

export interface ValidationStats {
  total: number
  valid: number
  invalid: number
  warnings: number
  duplicates: number
  missingYouTube: number
  missingLyrics: number
}

/**
 * Validate array of songs
 */
export function validateSongs(songs: unknown[]): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const stats: ValidationStats = {
    total: songs.length,
    valid: 0,
    invalid: 0,
    warnings: 0,
    duplicates: 0,
    missingYouTube: 0,
    missingLyrics: 0,
  }

  // Track duplicates
  const seen = new Set<string>()

  songs.forEach((song, index) => {
    try {
      // Validate schema
      const validated = SongSchema.parse(song)

      // Check for duplicates
      const key = `${validated.title.toLowerCase()}::${validated.artist.toLowerCase()}`
      if (seen.has(key)) {
        errors.push({
          index,
          songId: validated.id,
          field: 'title+artist',
          message: 'Duplicate song',
          value: key,
        })
        stats.duplicates++
        stats.invalid++
        return
      }
      seen.add(key)

      // Check YouTube URL
      if (!validated.youtubeUrl) {
        warnings.push({
          index,
          songId: validated.id,
          field: 'youtubeUrl',
          message: 'Missing YouTube URL',
        })
        stats.missingYouTube++
        stats.warnings++
      } else {
        // Validate YouTube URL format
        if (!isValidYouTubeUrl(validated.youtubeUrl)) {
          errors.push({
            index,
            songId: validated.id,
            field: 'youtubeUrl',
            message: 'Invalid YouTube URL format',
            value: validated.youtubeUrl,
          })
          stats.invalid++
          return
        }
      }

      // Check lyrics
      if (!validated.lyricsSnippet) {
        warnings.push({
          index,
          songId: validated.id,
          field: 'lyricsSnippet',
          message: 'Missing lyrics snippet',
        })
        stats.missingLyrics++
        stats.warnings++
      } else if (validated.lyricsSnippet.length > 150) {
        errors.push({
          index,
          songId: validated.id,
          field: 'lyricsSnippet',
          message: 'Lyrics snippet too long (max 150 chars)',
          value: validated.lyricsSnippet.length,
        })
        stats.invalid++
        return
      }

      // Check year
      if (validated.year) {
        const currentYear = new Date().getFullYear()
        if (validated.year > currentYear + 1) {
          warnings.push({
            index,
            songId: validated.id,
            field: 'year',
            message: 'Year is in the future',
            value: validated.year,
          })
          stats.warnings++
        }
      }

      // Check tempo
      if (validated.tempo) {
        if (validated.tempo < 40 || validated.tempo > 200) {
          warnings.push({
            index,
            songId: validated.id,
            field: 'tempo',
            message: 'Unusual tempo (typically 40-200 BPM)',
            value: validated.tempo,
          })
          stats.warnings++
        }
      }

      // Check tags
      if (validated.tags.length === 0) {
        warnings.push({
          index,
          songId: validated.id,
          field: 'tags',
          message: 'No tags provided',
        })
        stats.warnings++
      }

      // Thai-specific validations
      if (validated.language === 'Thai') {
        // Check if Thai genre is specified
        const thaiGenres = [
          'ลูกทุ่ง',
          'ลูกกรุง',
          'สตริง',
          'หมอลำ',
          'เพลงใต้',
          'เพลงเพื่อชีวิต',
          'สามช่า',
        ]
        if (!thaiGenres.some((g) => validated.genre.includes(g))) {
          warnings.push({
            index,
            songId: validated.id,
            field: 'genre',
            message: 'Thai song without Thai genre classification',
            value: validated.genre,
          })
          stats.warnings++
        }

        // Check for dialect when genre is หมอลำ or เพลงใต้
        if (
          (validated.genre.includes('หมอลำ') && validated.dialect !== 'Isaan') ||
          (validated.genre.includes('เพลงใต้') && validated.dialect !== 'Southern')
        ) {
          warnings.push({
            index,
            songId: validated.id,
            field: 'dialect',
            message: 'Expected dialect for genre',
            value: validated.dialect,
          })
          stats.warnings++
        }
      }

      stats.valid++
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          errors.push({
            index,
            songId: (song as any)?.id || 'unknown',
            field: err.path.join('.'),
            message: err.message,
            value: err.code,
          })
        })
      } else {
        errors.push({
          index,
          songId: (song as any)?.id || 'unknown',
          field: 'unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
      stats.invalid++
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats,
  }
}

/**
 * Validate YouTube URL format
 */
function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/,
    /^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11}/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/,
  ]

  return patterns.some((pattern) => pattern.test(url))
}

/**
 * Print validation report
 */
export function printValidationReport(result: ValidationResult): void {
  console.log('\n' + '='.repeat(60))
  console.log('VALIDATION REPORT')
  console.log('='.repeat(60))

  // Stats
  console.log('\nStatistics:')
  console.log(`  Total songs: ${result.stats.total}`)
  console.log(
    `  Valid: ${result.stats.valid} (${((result.stats.valid / result.stats.total) * 100).toFixed(1)}%)`
  )
  console.log(
    `  Invalid: ${result.stats.invalid} (${((result.stats.invalid / result.stats.total) * 100).toFixed(1)}%)`
  )
  console.log(`  Duplicates: ${result.stats.duplicates}`)
  console.log(`  Missing YouTube: ${result.stats.missingYouTube}`)
  console.log(`  Missing Lyrics: ${result.stats.missingLyrics}`)
  console.log(`  Warnings: ${result.stats.warnings}`)

  // Errors
  if (result.errors.length > 0) {
    console.log('\nErrors:')
    result.errors.forEach((error) => {
      console.log(
        `  [${error.index}] ${error.songId} - ${error.field}: ${error.message}`
      )
      if (error.value !== undefined) {
        console.log(`    Value: ${error.value}`)
      }
    })
  }

  // Warnings (limit to first 10)
  if (result.warnings.length > 0) {
    console.log('\nWarnings (first 10):')
    result.warnings.slice(0, 10).forEach((warning) => {
      console.log(
        `  [${warning.index}] ${warning.songId} - ${warning.field}: ${warning.message}`
      )
    })
    if (result.warnings.length > 10) {
      console.log(`  ... and ${result.warnings.length - 10} more warnings`)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  if (result.valid) {
    console.log('✓ All songs passed validation!')
  } else {
    console.log(`✗ ${result.errors.length} errors found`)
  }
  console.log('='.repeat(60) + '\n')
}

/**
 * Filter out invalid songs
 */
export function filterValidSongs(
  songs: unknown[],
  result: ValidationResult
): Song[] {
  const invalidIndices = new Set(result.errors.map((e) => e.index))
  return songs
    .filter((_, index) => !invalidIndices.has(index))
    .map((song) => song as Song)
}

/**
 * CLI usage
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const run = async () => {
    const args = process.argv.slice(2)
    const inputFile = args.find((a) => a.startsWith('--input='))?.split('=')[1]
    const fix = args.includes('--fix')

    if (!inputFile) {
      console.error(
        'Usage: npm run validate -- --input=<file> [--fix]'
      )
      console.error('')
      console.error('Options:')
      console.error('  --input=<file>  Input JSON file to validate')
      console.error('  --fix           Remove invalid songs and save')
      process.exit(1)
    }

    log(`Reading: ${inputFile}`)
    const songs = await readJSON<unknown[]>(inputFile)

    log(`Validating ${songs.length} songs...`)
    const result = validateSongs(songs)

    printValidationReport(result)

    if (fix && !result.valid) {
      const validSongs = filterValidSongs(songs, result)
      const outputFile = inputFile.replace('.json', '-valid.json')

      const fs = await import('fs/promises')
      await fs.writeFile(outputFile, JSON.stringify(validSongs, null, 2))

      log(`Saved ${validSongs.length} valid songs to: ${outputFile}`)
    }

    // Exit with error code if validation failed
    process.exit(result.valid ? 0 : 1)
  }

  run().catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
}
