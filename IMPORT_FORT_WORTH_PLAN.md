# Importing the Fort Worth Bible Church 2025 Reading Plan

This guide will help you import the Fort Worth Bible Church "Bible in a Year" plan (October 30 - December 31, 2025) with 4 daily readings:
- **Gospel** (John)
- **Early Church** (2 Peter through Revelation)
- **Wisdom** (Job)
- **History & Prophets** (Ezekiel through Malachi)

## Step 1: Apply Database Migration

The plan requires a new `category` field in the `plan_items` table to label each reading type.

1. Go to your Supabase Dashboard: https://zeuhfxlpscrwoqqvsxny.supabase.co
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/20250107_add_category_to_plan_items.sql`
5. Click **Run**

You should see: `Success. No rows returned`

## Step 2: Run the Import Script

Make sure your dev server is running on port 3002, then run:

```bash
npx tsx scripts/import-fort-worth-plan.ts
```

This will:
- Create a new plan titled "Fort Worth Bible Church 2025 - Bible in a Year (Oct-Dec)"
- Import all 244 readings (61 days × 4 readings each)
- Mark the plan as **public** so your study group can access it
- Assign proper dates and categories to each reading

Expected output:
```
🚀 Starting Fort Worth Bible Plan import...

✅ Import successful!

📖 Plan ID: <uuid>
📅 Total Days: 61
📚 Total Readings: 244

Successfully imported Fort Worth Bible plan with 244 readings across 61 days

🔗 View plan at: http://localhost:3002/plans/<plan-id>

💡 The plan is now public and can be accessed by your study group!
```

## Step 3: Generate Lessons

After importing the plan, you need to generate the actual lesson content (AI-generated study notes, web stories, and quizzes):

1. Go to http://localhost:3002/plans/<plan-id>
2. Click **Generate Lessons** button
3. Wait for the AI to generate content for all 244 readings (this may take a while!)

**Note:** Lesson generation can be resource-intensive. You may want to:
- Generate lessons in batches (modify the lesson generation to process X items at a time)
- Run generation overnight
- Consider OpenAI API costs (244 readings × GPT-4 calls)

## Step 4: Share with Study Group

Once lessons are generated, you can share the plan with your study group:

### Option A: Share Individual Lesson Links
Each lesson gets a unique share URL like: `http://localhost:3002/s/<share-slug>`

Users can access these directly without needing an account.

### Option B: Share the Plan (requires accounts)
Since the plan is marked as `is_public = true`, any authenticated user can view it by navigating to:
`http://localhost:3002/plans/<plan-id>`

## Data Structure

The imported plan has this structure:

```
Plan
├── Title: "Fort Worth Bible Church 2025 - Bible in a Year (Oct-Dec)"
├── is_public: true
└── Plan Items (244 total)
    ├── Date: 2025-10-30
    │   ├── [Gospel] John 8:12-20
    │   ├── [Early Church] 2 Peter 2:10-16
    │   ├── [Wisdom] Job 4
    │   └── [History & Prophets] Ezekiel 13-15
    ├── Date: 2025-10-31
    │   ├── [Gospel] John 8:21-30
    │   ├── [Early Church] 2 Peter 2:17-22
    │   ├── [Wisdom] Job 5
    │   └── [History & Prophets] Ezekiel 16
    └── ... (59 more days)
```

Each plan item will generate a separate lesson with:
- AI-generated intro, message, and conclusion
- Historical and narrative context
- Key takeaways
- Discussion questions
- Interactive quiz
- Shareable web story format

## Troubleshooting

**Error: "Unauthorized"**
- Make sure you're logged in at http://localhost:3002/auth
- The import script uses your authentication session

**Error: "Failed to create plan items"**
- Check that the migration was applied successfully
- Verify the `category` column exists in `plan_items` table

**Lesson generation takes too long**
- Consider modifying `/app/api/lessons/generate/route.ts` to process in smaller batches
- Monitor your OpenAI API usage at https://platform.openai.com/usage

## Files Created

- `supabase/migrations/20250107_add_category_to_plan_items.sql` - Database migration
- `data/fort-worth-bible-plan.json` - Structured reading data
- `app/api/plans/import-fort-worth/route.ts` - API endpoint for import
- `scripts/import-fort-worth-plan.ts` - Import script

## Next Steps

After completing the import:
1. ✅ Test accessing lessons via share URLs
2. ✅ Invite study group members to create accounts
3. ✅ Share the plan ID or individual lesson URLs
4. ✅ Track progress through the dashboard

Enjoy your Fort Worth Bible Study Plan! 📖✨
