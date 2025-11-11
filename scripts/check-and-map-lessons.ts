import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAndMapLessons() {
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

  console.log(`\n=== CHECKING PLAN: ${planTitle} ===`);

  // Get plan items
  const { data: planItems } = await supabase
    .from('plan_items')
    .select('id, index, references_text, status')
    .eq('plan_id', plan.id)
    .order('index');

  console.log(`\nFound ${planItems?.length || 0} plan items`);

  if (!planItems || planItems.length === 0) return;

  let mappedCount = 0;
  let generatedCount = 0;
  const mappingsToCreate = [];

  for (const item of planItems) {
    const reference = item.references_text[0];

    // Check if mapping already exists
    const { data: existingMapping } = await supabase
      .from('plan_item_lessons')
      .select('id')
      .eq('plan_item_id', item.id)
      .single();

    if (existingMapping) {
      console.log(`✓ Item ${item.index}: ${reference} - Already mapped`);
      mappedCount++;
      continue;
    }

    // Normalize reference format
    const normalizedReference = reference.replace(/-/g, '–');

    // Look for canonical lesson
    const { data: canonicalLesson } = await supabase
      .from('lessons')
      .select('id, status')
      .eq('passage_canonical', normalizedReference)
      .eq('translation', 'ESV')
      .single();

    if (canonicalLesson) {
      console.log(`→ Item ${item.index}: ${reference} - Found lesson (${canonicalLesson.status})`);
      mappingsToCreate.push({
        plan_item_id: item.id,
        lesson_id: canonicalLesson.id
      });
      generatedCount++;
    } else {
      console.log(`✗ Item ${item.index}: ${reference} - No lesson found`);
    }
  }

  // Create mappings
  if (mappingsToCreate.length > 0) {
    console.log(`\n📝 Creating ${mappingsToCreate.length} lesson mappings...`);

    const { error: mappingError } = await supabase
      .from('plan_item_lessons')
      .insert(mappingsToCreate);

    if (mappingError) {
      console.error('Error creating mappings:', mappingError);
    } else {
      // Update plan items to published
      const itemIds = mappingsToCreate.map(m => m.plan_item_id);
      await supabase
        .from('plan_items')
        .update({ status: 'published' })
        .in('id', itemIds);

      console.log(`✅ Successfully mapped ${mappingsToCreate.length} lessons!`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Already mapped: ${mappedCount}`);
  console.log(`Newly mapped: ${mappingsToCreate.length}`);
  console.log(`Not found: ${planItems.length - mappedCount - mappingsToCreate.length}`);
}

checkAndMapLessons();
