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
    const { userId, lessonId, timeSpent } = body

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Upsert progress
    const { error } = await supabase
      .from('progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          completed_at: new Date().toISOString(),
          time_spent_sec: timeSpent,
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      )

    if (error) {
      console.error('Error updating progress:', error)
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error in complete progress API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
