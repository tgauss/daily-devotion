#!/usr/bin/env node

/**
 * Script to import the Fort Worth Bible Church 2025 reading plan
 *
 * Usage: npx tsx scripts/import-fort-worth-plan.ts
 *
 * This will:
 * 1. Create a new plan in the database
 * 2. Add all readings (4 per day) from Oct 30 - Dec 31, 2025
 * 3. Mark the plan as public so your study group can access it
 */

async function importPlan() {
  console.log('🚀 Starting Fort Worth Bible Plan import...\n')

  try {
    // Make the API call to import
    const response = await fetch('http://localhost:3002/api/plans/import-fort-worth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        makePublic: true, // Allow study group access
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to import: ${error.error}\n${error.details || ''}`)
    }

    const result = await response.json()

    console.log('✅ Import successful!')
    console.log(`\n📖 Plan ID: ${result.planId}`)
    console.log(`📅 Total Days: ${result.totalDays}`)
    console.log(`📚 Total Readings: ${result.totalReadings}`)
    console.log(`\n${result.message}`)
    console.log(`\n🔗 View plan at: http://localhost:3002/plans/${result.planId}`)
    console.log(`\n💡 The plan is now public and can be accessed by your study group!`)
  } catch (error: any) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

importPlan()
