import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated (admin check could be added here)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lessonId, isFeatured } = await request.json()

    if (!lessonId || typeof isFeatured !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Use service client to update the lesson
    const serviceClient = createServiceClient()
    const { error } = await serviceClient
      .from('lessons')
      .update({ is_featured: isFeatured })
      .eq('id', lessonId)

    if (error) {
      console.error('Error updating lesson:', error)
      return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in toggle-featured-lesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
