import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPlan() {
  const { data: plan } = await supabase
    .from('plans')
    .select('id, title, schedule_mode, source, created_at')
    .eq('title', 'Exploring Biblical Prophecies')
    .single();

  if (!plan) {
    console.log('Plan not found');
    return;
  }

  console.log('\n=== PLAN INFO ===');
  console.log('Title:', plan.title);
  console.log('Schedule Mode:', plan.schedule_mode);
  console.log('Source:', plan.source);
  console.log('Created:', plan.created_at);
}

checkPlan();
