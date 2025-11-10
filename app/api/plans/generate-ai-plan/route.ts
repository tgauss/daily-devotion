import { NextRequest, NextResponse } from 'next/server'
import { getAILessonGenerator } from '@/lib/services/ai-lesson-generator'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { theme, bookContext, depthLevel } = body

    // Validate input
    if (!theme || typeof theme !== 'string' || theme.trim().length < 10) {
      return NextResponse.json(
        { error: 'Theme is required and must be at least 10 characters' },
        { status: 400 }
      )
    }

    const validDepthLevels = ['simple', 'moderate', 'deep']
    if (depthLevel && !validDepthLevels.includes(depthLevel)) {
      return NextResponse.json(
        { error: 'Invalid depth level. Must be simple, moderate, or deep' },
        { status: 400 }
      )
    }

    // Generate AI plan
    const aiGenerator = getAILessonGenerator()
    const result = await aiGenerator.generateAIPlan({
      theme: theme.trim(),
      bookContext: bookContext?.trim(),
      depthLevel: depthLevel || 'moderate'
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] AI plan generation error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate AI plan' },
      { status: 500 }
    )
  }
}
