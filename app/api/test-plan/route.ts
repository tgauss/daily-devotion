import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const planId = request.nextUrl.searchParams.get('id') || '45b7f3e7-6c13-458b-b929-cf9cbc6d13e1'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Test 1: Basic plan query with regular client
    const { data: planBasic, error: basicError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()

    // Test 2: Nested query with regular client
    const { data: planNested, error: nestedError } = await supabase
      .from('plans')
      .select('*, plan_items(*, lessons(*))')
      .eq('id', planId)
      .single()

    // Test 3: Service client basic
    const serviceClient = createServiceClient()
    const { data: planService, error: serviceError } = await serviceClient
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()

    // Test 4: Service client nested
    const { data: planServiceNested, error: serviceNestedError } = await serviceClient
      .from('plans')
      .select('*, plan_items(*, lessons(*))')
      .eq('id', planId)
      .single()

    return NextResponse.json({
      planId,
      user: user ? { id: user.id, email: user.email } : null,
      tests: {
        basicQuery: {
          success: !!planBasic,
          error: basicError?.message,
          data: planBasic ? { id: planBasic.id, title: planBasic.title, user_id: planBasic.user_id, is_public: planBasic.is_public } : null
        },
        nestedQuery: {
          success: !!planNested,
          error: nestedError?.message,
          itemCount: planNested?.plan_items?.length || 0
        },
        serviceBasicQuery: {
          success: !!planService,
          error: serviceError?.message,
          data: planService ? { id: planService.id, title: planService.title, user_id: planService.user_id, is_public: planService.is_public } : null
        },
        serviceNestedQuery: {
          success: !!planServiceNested,
          error: serviceNestedError?.message,
          itemCount: planServiceNested?.plan_items?.length || 0
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
