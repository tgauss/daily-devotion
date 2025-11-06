import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import fortWorthPlan from '@/data/fort-worth-bible-plan.json'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()

    // Verify the requesting user is authenticated (basic check)
    const {
      data: { user: adminUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { email, password, first_name, last_name, phone_number, preloadFortWorth } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    console.log(`[Admin] Creating user: ${email}`)

    // Create user via Supabase Admin API
    const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: first_name || null,
        last_name: last_name || null,
      },
    })

    if (createError || !newUser.user) {
      console.error('[Admin] User creation error:', createError)
      return NextResponse.json({ error: 'Failed to create user', details: createError?.message }, { status: 500 })
    }

    console.log(`[Admin] User created: ${newUser.user.id}`)

    // Update the user profile in public.users with additional fields
    // The trigger should have already created the basic record
    const { error: updateError } = await serviceClient
      .from('users')
      .update({
        first_name: first_name || null,
        last_name: last_name || null,
        phone_number: phone_number || null,
      })
      .eq('id', newUser.user.id)

    if (updateError) {
      console.error('[Admin] Profile update error:', updateError)
      // Don't fail the whole request if profile update fails
    }

    let lessonsCopied = 0
    let planId = null

    // If preloadFortWorth is true, import the Fort Worth plan for this user
    if (preloadFortWorth) {
      console.log(`[Admin] Pre-loading Fort Worth plan for user ${newUser.user.id}`)

      try {
        // Create the plan
        const { data: plan, error: planError } = await serviceClient
          .from('plans')
          .insert({
            user_id: newUser.user.id,
            title: 'Fort Worth Bible Church 2025 - Bible in a Year (Oct-Dec)',
            description: 'A systematic Bible reading plan covering the Gospel of John, Early Church letters (2 Peter through Revelation), Job, and the Major & Minor Prophets. Four daily readings from October 30 through December 31, 2025.',
            schedule_type: 'daily',
            source: 'import',
            theme: 'Complete Bible Reading',
            is_public: true,
          })
          .select()
          .single()

        if (planError) {
          console.error('[Admin] Plan creation error:', planError)
        } else {
          planId = plan.id
          console.log(`[Admin] Created plan: ${plan.id}`)

          // Create plan items
          const planItemsToInsert = []
          let itemIndex = 0

          for (const day of fortWorthPlan) {
            for (const reading of day.readings) {
              planItemsToInsert.push({
                plan_id: plan.id,
                index: itemIndex++,
                date_target: day.date,
                references_text: [reading.reference],
                category: reading.category,
                translation: 'ESV',
                status: 'pending',
              })
            }
          }

          const { data: createdPlanItems, error: itemsError } = await serviceClient
            .from('plan_items')
            .insert(planItemsToInsert)
            .select('id, references_text, translation')

          if (itemsError || !createdPlanItems) {
            console.error('[Admin] Plan items creation error:', itemsError)
          } else {
            console.log(`[Admin] Created ${createdPlanItems.length} plan items`)

            // Try to copy lessons from existing Fort Worth plan
            const { data: existingPlans } = await serviceClient
              .from('plans')
              .select('id')
              .eq('title', 'Fort Worth Bible Church 2025 - Bible in a Year (Oct-Dec)')
              .neq('id', plan.id)
              .limit(1)

            if (existingPlans && existingPlans.length > 0) {
              const templatePlanId = existingPlans[0].id
              console.log(`[Admin] Found template plan ${templatePlanId}, copying lessons`)

              const { data: templatePlanItems } = await serviceClient
                .from('plan_items')
                .select('references_text, lessons(*)')
                .eq('plan_id', templatePlanId)
                .not('lessons', 'is', null)

              if (templatePlanItems && templatePlanItems.length > 0) {
                const templateLessonsMap = new Map()
                for (const item of templatePlanItems) {
                  const ref = item.references_text[0]
                  if (item.lessons && item.lessons.length > 0) {
                    templateLessonsMap.set(ref, item.lessons[0])
                  }
                }

                const lessonsToCopy = []
                for (const newItem of createdPlanItems) {
                  const ref = newItem.references_text[0]
                  const templateLesson = templateLessonsMap.get(ref)

                  if (templateLesson) {
                    lessonsToCopy.push({
                      plan_item_id: newItem.id,
                      passage_canonical: templateLesson.passage_canonical,
                      passage_text: templateLesson.passage_text,
                      translation: templateLesson.translation,
                      ai_triptych_json: templateLesson.ai_triptych_json,
                      story_manifest_json: templateLesson.story_manifest_json,
                      quiz_json: templateLesson.quiz_json,
                      share_slug: crypto.randomBytes(16).toString('hex'),
                      published_at: new Date().toISOString(),
                    })
                  }
                }

                if (lessonsToCopy.length > 0) {
                  const { error: lessonsError } = await serviceClient
                    .from('lessons')
                    .insert(lessonsToCopy)

                  if (!lessonsError) {
                    const itemIdsWithLessons = lessonsToCopy.map(l => l.plan_item_id)
                    await serviceClient
                      .from('plan_items')
                      .update({ status: 'published' })
                      .in('id', itemIdsWithLessons)

                    lessonsCopied = lessonsToCopy.length
                    console.log(`[Admin] Copied ${lessonsCopied} lessons`)
                  }
                }
              }
            }
          }
        }
      } catch (planError: any) {
        console.error('[Admin] Fort Worth import error:', planError)
        // Don't fail the whole request if plan import fails
      }
    }

    return NextResponse.json({
      success: true,
      userId: newUser.user.id,
      email: newUser.user.email,
      planId,
      lessonsCopied,
      message: `User created successfully${preloadFortWorth ? ` with Fort Worth plan (${lessonsCopied} lessons pre-loaded)` : ''}`,
    })
  } catch (error: any) {
    console.error('[Admin] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
