import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getSpiritualGuidanceGenerator } from '@/lib/services/spiritual-guidance-generator'
import { getPassageAdapter } from '@/lib/services/passage-adapter'

/**
 * Create Spiritual Guidance (Guidance Guide)
 * Generates personalized Bible-based guidance for user's life situation
 *
 * This endpoint runs on Vercel Pro with 5-minute timeout
 */
export const maxDuration = 300 // 5 minutes (Vercel Pro)

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
    const { situation } = body

    // Validate input
    if (!situation || typeof situation !== 'string') {
      return NextResponse.json({ error: 'Situation text is required' }, { status: 400 })
    }

    if (situation.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide more context about your situation (at least 10 characters)' },
        { status: 400 }
      )
    }

    if (situation.length > 1000) {
      return NextResponse.json(
        { error: 'Situation text is too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    console.log('[Guidance] Starting generation for user:', user.id)

    // Get AI service
    const guidanceGenerator = getSpiritualGuidanceGenerator()
    const passageAdapter = getPassageAdapter('ESV')

    // Step 1: AI suggests relevant passages (10-15 seconds)
    console.log('[Guidance] Step 1: Suggesting passages...')
    const suggestionResult = await guidanceGenerator.suggestPassages({
      situation: situation.trim(),
    })

    console.log('[Guidance] AI suggested', suggestionResult.passages.length, 'passages')

    // Step 2: Fetch full passage texts from ESV API (5-10 seconds)
    console.log('[Guidance] Step 2: Fetching passage texts...')
    const passagesWithText = await Promise.all(
      suggestionResult.passages.map(async (passage) => {
        try {
          const passageData = await passageAdapter.getPassageText(
            passage.reference,
            passage.translation
          )
          return {
            ...passage,
            text: passageData.text,
            reference: passageData.canonical, // Use canonical reference
          }
        } catch (error) {
          console.error(`Failed to fetch passage: ${passage.reference}`, error)
          // Return passage with encouraging fallback text if API fails
          return {
            ...passage,
            text: `We're having trouble fetching the full text for ${passage.reference} right now, but this passage speaks powerfully to your situation. You can look it up in your Bible or at BibleGateway.com.`,
          }
        }
      })
    )

    console.log('[Guidance] Fetched', passagesWithText.length, 'passage texts')

    // Step 3: AI generates compassionate guidance (20-30 seconds)
    console.log('[Guidance] Step 3: Generating guidance...')
    const guidanceResult = await guidanceGenerator.generateGuidance({
      situation: situation.trim(),
      passages: passagesWithText,
    })

    console.log('[Guidance] Guidance generated successfully')

    // Step 4: Store in database
    console.log('[Guidance] Step 4: Saving to database...')
    const { data: guidance, error: insertError } = await supabase
      .from('spiritual_guidance')
      .insert({
        user_id: user.id,
        situation_text: situation.trim(),
        passages: passagesWithText,
        guidance_content: guidanceResult.guidance_content,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Guidance] Database error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save guidance', details: insertError.message },
        { status: 500 }
      )
    }

    console.log('[Guidance] Complete! Guidance ID:', guidance.id)

    return NextResponse.json(
      {
        success: true,
        guidance: {
          id: guidance.id,
          situation_text: guidance.situation_text,
          passages: guidance.passages,
          guidance_content: guidance.guidance_content,
          created_at: guidance.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[Guidance] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate guidance',
        details: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
