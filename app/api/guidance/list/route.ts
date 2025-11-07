import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * List User's Spiritual Guidance History
 * Returns paginated list of user's guidance entries
 * Supports search filtering on situation_text
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters (page >= 1, 1 <= limit <= 100)' },
        { status: 400 }
      )
    }

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('spiritual_guidance')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply search filter if provided
    if (search.trim()) {
      query = query.ilike('situation_text', `%${search.trim()}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: guidanceList, error, count } = await query

    if (error) {
      console.error('[Guidance List] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch guidance history', details: error.message },
        { status: 500 }
      )
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: guidanceList || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    })
  } catch (error: any) {
    console.error('[Guidance List] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch guidance history',
        details: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
