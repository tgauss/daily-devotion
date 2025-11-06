import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, lessonId, score } = body

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update progress with quiz score
    const { error } = await supabase
      .from('progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          quiz_score: score,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      )

    if (error) {
      console.error('Error updating quiz score:', error)
      return NextResponse.json({ error: 'Failed to update quiz score' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error in quiz progress API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
