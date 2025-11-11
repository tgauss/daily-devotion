import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function unenroll() {
  const userId = '71c8c1b0-43d6-42f3-ba0f-5a6e74f45a7d';
  const planTitle = 'Exploring Biblical Prophecies';

  // Find the plan
  const { data: plan } = await supabase
    .from('plans')
    .select('id')
    .eq('title', planTitle)
    .single();

  if (!plan) {
    console.log('Plan not found');
    return;
  }

  // Delete the enrollment
  const { error } = await supabase
    .from('user_plan_enrollments')
    .delete()
    .eq('user_id', userId)
    .eq('plan_id', plan.id);

  if (error) {
    console.error('Error unenrolling:', error);
    return;
  }

  console.log(`✅ Successfully unenrolled from "${planTitle}"`);
}

unenroll();
