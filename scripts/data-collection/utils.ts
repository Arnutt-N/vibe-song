import fs from 'fs/promises'
import path from 'path'

/**
 * Sleep for specified milliseconds
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Log message with timestamp and level
 */
export function log(
  message: string,
  level: 'info' | 'warn' | 'error' = 'info'
): void {
  const timestamp = new Date().toISOString()
  const prefix = {
    info: '✓',
    warn: '⚠',
    error: '✗',
  }[level]

  console.log(`[${timestamp}] ${prefix} ${message}`)
}

/**
 * Load cached data from JSON file
 */
export function loadCache<T>(file: string, key: string): T | null {
  try {
    const cacheDir = path.join(process.cwd(), 'data', 'cache')
    const cachePath = path.join(cacheDir, file)

    // Check if file exists synchronously (for caching)
    const fs = require('fs')
    if (!fs.existsSync(cachePath)) {
      return null
    }

    const data = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
    return data[key] || null
  } catch (error) {
    return null
  }
}

/**
 * Save data to cache JSON file
 */
export function saveCache<T>(file: string, key: string, data: T): void {
  try {
    const cacheDir = path.join(process.cwd(), 'data', 'cache')
    const cachePath = path.join(cacheDir, file)

    // Ensure cache directory exists
    const fs = require('fs')
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true })
    }

    // Load existing cache or create new
    let cache: Record<string, T> = {}
    if (fs.existsSync(cachePath)) {
      cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
    }

    // Update cache
    cache[key] = data

    // Save
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2))
  } catch (error) {
    log(`Failed to save cache: ${error}`, 'error')
  }
}

/**
 * Ensure directory exists, create if not
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true })
  } catch (error) {
    // Directory might already exist, ignore error
  }
}

/**
 * Read JSON file
 */
export async function readJSON<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(content)
}

/**
 * Write JSON file
 */
export async function writeJSON<T>(
  filePath: string,
  data: T,
  pretty = true
): Promise<void> {
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
  await fs.writeFile(filePath, content, 'utf-8')
}

/**
 * Generate unique ID for song
 */
export function generateSongId(title: string, artist: string): string {
  const normalized = `${title}-${artist}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)

  const timestamp = Date.now().toString(36)
  return `song-${normalized}-${timestamp}`
}

/**
 * Deduplicate songs by title and artist
 */
export function deduplicateSongs<T extends { title: string; artist: string }>(
  songs: T[]
): T[] {
  const seen = new Set<string>()
  const unique: T[] = []

  for (const song of songs) {
    const key = `${song.title.toLowerCase()}::${song.artist.toLowerCase()}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(song)
    }
  }

  return unique
}

/**
 * Progress bar for terminal
 */
export class ProgressBar {
  private current = 0
  private readonly barLength = 40

  constructor(
    private total: number,
    private label = 'Progress'
  ) {}

  update(current: number): void {
    this.current = current
    this.render()
  }

  increment(): void {
    this.current++
    this.render()
  }

  private render(): void {
    const percentage = Math.floor((this.current / this.total) * 100)
    const filled = Math.floor((this.current / this.total) * this.barLength)
    const empty = this.barLength - filled

    const bar = '█'.repeat(filled) + '░'.repeat(empty)
    const output = `\r${this.label}: [${bar}] ${percentage}% (${this.current}/${this.total})`

    process.stdout.write(output)

    if (this.current >= this.total) {
      process.stdout.write('\n')
    }
  }

  complete(): void {
    this.update(this.total)
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    onRetry?: (error: Error, attempt: number) => void
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options

  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt < maxRetries) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay)
        onRetry?.(lastError, attempt + 1)
        await sleep(delay)
      }
    }
  }

  throw lastError!
}

/**
 * Batch process items with rate limiting
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: {
    batchSize?: number
    delayBetweenBatches?: number
    onProgress?: (completed: number, total: number) => void
  } = {}
): Promise<R[]> {
  const { batchSize = 10, delayBetweenBatches = 1000, onProgress } = options

  const results: R[] = []
  const batches: T[][] = []

  // Split into batches
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }

  // Process batches
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    const batchResults = await Promise.all(
      batch.map((item, idx) => processor(item, i * batchSize + idx))
    )

    results.push(...batchResults)

    // Progress callback
    onProgress?.(results.length, items.length)

    // Delay between batches (except last)
    if (i < batches.length - 1) {
      await sleep(delayBetweenBatches)
    }
  }

  return results
}

/**
 * Format duration from seconds to mm:ss
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Sanitize string for use in filenames
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9-_\.]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
}

/**
 * Get file size in human-readable format
 */
export async function getFileSize(filePath: string): Promise<string> {
  try {
    const stats = await fs.stat(filePath)
    const bytes = stats.size

    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  } catch {
    return 'Unknown'
  }
}

/**
 * Count lines in file
 */
export async function countLines(filePath: string): Promise<number> {
  const content = await fs.readFile(filePath, 'utf-8')
  return content.split('\n').length
}
