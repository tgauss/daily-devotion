import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Get Spiritual Guidance by ID
 * Returns a specific guidance entry if it belongs to the authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid guidance ID format' }, { status: 400 })
    }

    // Fetch guidance (RLS automatically ensures user_id matches)
    const { data: guidance, error } = await supabase
      .from('spiritual_guidance')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // Explicit ownership check
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { error: 'Guidance not found or access denied' },
          { status: 404 }
        )
      }

      console.error('[Guidance Get] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch guidance', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      guidance,
    })
  } catch (error: any) {
    console.error('[Guidance Get] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch guidance',
        details: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * Delete Spiritual Guidance by ID
 * Allows users to delete their own guidance entries
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid guidance ID format' }, { status: 400 })
    }

    // Delete guidance (RLS automatically ensures user_id matches)
    const { error } = await supabase
      .from('spiritual_guidance')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Explicit ownership check

    if (error) {
      console.error('[Guidance Delete] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete guidance', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Guidance deleted successfully',
    })
  } catch (error: any) {
    console.error('[Guidance Delete] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete guidance',
        details: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
