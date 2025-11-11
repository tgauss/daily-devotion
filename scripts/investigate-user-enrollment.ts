import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function investigate() {
  const userId = '71c8c1b0-43d6-42f3-ba0f-5a6e74f45a7d';

  // Find the enrollment
  const { data: enrollment } = await supabase
    .from('user_plan_enrollments')
    .select('*, plans(title, schedule_mode)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('enrolled_at', { ascending: false })
    .limit(1)
    .single();

  if (!enrollment) {
    console.log('No enrollment found');
    return;
  }

  console.log('\n=== ENROLLMENT INFO ===');
  console.log('Plan:', enrollment.plans.title);
  console.log('Schedule Mode:', enrollment.plans.schedule_mode);
  console.log('Custom Start Date:', enrollment.custom_start_date);
  console.log('Enrolled At:', enrollment.enrolled_at);

  // Check plan items
  const { data: planItems } = await supabase
    .from('plan_items')
    .select('id, index, status, date_target, references_text')
    .eq('plan_id', enrollment.plan_id)
    .order('index')
    .limit(5);

  console.log('\n=== FIRST 5 PLAN ITEMS ===');
  planItems?.forEach(item => {
    console.log(`Item ${item.index}: ${item.references_text[0]} - Status: ${item.status}`);
  });

  // Check if lessons are mapped
  const { data: mappings, count } = await supabase
    .from('plan_item_lessons')
    .select('*, lessons(id, status)', { count: 'exact' })
    .in('plan_item_id', planItems?.map(i => i.id) || []);

  console.log('\n=== LESSON MAPPINGS ===');
  console.log(`Mapped lessons: ${count || 0} out of ${planItems?.length || 0}`);
  mappings?.forEach(m => {
    console.log(`  Lesson status: ${m.lessons?.status || 'NOT FOUND'}`);
  });
}

investigate();
