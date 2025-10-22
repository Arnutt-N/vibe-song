import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { recommendationService } from '@/services/recommendation-service'
import type { RecommendationRequest, RecommendationResponse } from '@/types'

// Request validation schema
const recommendRequestSchema = z.object({
  mood: z.object({
    emoji: z.string().nullable(),
    energyLevel: z.number().min(1).max(10),
    moodValence: z.number().min(1).max(10),
  }),
  userId: z.string().optional(),
  limit: z.number().min(1).max(50).optional().default(20),
  offset: z.number().min(0).optional().default(0),
})

/**
 * POST /api/recommend
 * Generate music recommendations based on mood
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validated = recommendRequestSchema.parse(body)

    // Check if mood emoji is provided
    if (!validated.mood.emoji) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mood emoji is required',
        },
        { status: 400 }
      )
    }

    // Generate recommendations
    const tracks = await recommendationService.generateRecommendations({
      mood: validated.mood as any,
      userId: validated.userId,
      limit: validated.limit,
      offset: validated.offset,
    })

    // Create response
    const response: RecommendationResponse = {
      tracks,
      total: tracks.length,
      mood: validated.mood as any,
      requestId: crypto.randomUUID(),
    }

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error('Error in /api/recommend:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/recommend
 * Get quick/popular recommendations without mood input
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const genre = searchParams.get('genre')

    let tracks

    if (genre) {
      // Get recommendations by genre
      tracks = await recommendationService.getRecommendationsByGenre(
        genre,
        limit
      )
    } else {
      // Get popular/quick recommendations
      tracks = await recommendationService.getQuickRecommendations(limit)
    }

    return NextResponse.json({
      success: true,
      data: {
        tracks,
        total: tracks.length,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/recommend:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get recommendations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
