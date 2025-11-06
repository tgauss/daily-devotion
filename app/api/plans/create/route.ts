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
    const { userId, title, description, theme, source, references, scheduleType } = body

    // Validate request
    if (!title || !references || references.length === 0) {
      return NextResponse.json(
        { error: 'Title and references are required' },
        { status: 400 }
      )
    }

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create plan
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .insert({
        user_id: userId,
        title,
        description,
        theme,
        source: source || 'custom',
        schedule_type: scheduleType || 'daily',
        is_public: false,
      })
      .select()
      .single()

    if (planError) {
      console.error('Error creating plan:', planError)
      return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
    }

    // Create plan items
    const planItems = references.map((ref: string, index: number) => {
      // Calculate target date based on schedule type
      const startDate = new Date()
      let targetDate: Date

      if (scheduleType === 'weekly') {
        targetDate = new Date(startDate)
        targetDate.setDate(startDate.getDate() + index * 7)
      } else {
        // daily
        targetDate = new Date(startDate)
        targetDate.setDate(startDate.getDate() + index)
      }

      return {
        plan_id: plan.id,
        index,
        references_text: [ref],
        translation: 'ESV',
        status: 'pending' as const,
        date_target: targetDate.toISOString().split('T')[0],
      }
    })

    const { error: itemsError } = await supabase.from('plan_items').insert(planItems)

    if (itemsError) {
      console.error('Error creating plan items:', itemsError)
      // Cleanup: delete the plan if items failed
      await supabase.from('plans').delete().eq('id', plan.id)
      return NextResponse.json({ error: 'Failed to create plan items' }, { status: 500 })
    }

    return NextResponse.json({ planId: plan.id }, { status: 201 })
  } catch (error) {
    console.error('Error in create plan API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
