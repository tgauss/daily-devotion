import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/plans/library
 * Fetches public plans for the library with optional filters
 * Query params:
 * - featured: boolean (only featured plans)
 * - depth_level: 'simple' | 'moderate' | 'deep'
 * - search: string (search in title/description)
 * - limit: number (default 20)
 * - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    const featured = searchParams.get('featured') === 'true'
    const depthLevel = searchParams.get('depth_level')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Start query for public plans
    let query = supabase
      .from('plans')
      .select(`
        *,
        plan_library_stats (
          participant_count,
          completion_count,
          last_started_at
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    // Apply filters
    if (featured) {
      query = query.eq('featured', true)
    }

    if (depthLevel && ['simple', 'moderate', 'deep'].includes(depthLevel)) {
      query = query.eq('depth_level', depthLevel)
    }

    if (search && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},theme.ilike.${searchTerm}`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: plans, error } = await query

    if (error) {
      console.error('Error fetching public plans:', error)
      return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
    }

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error in library endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
