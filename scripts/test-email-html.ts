/**
 * Test script to verify email HTML output
 */

import { getWelcomeEmailHTML } from '../lib/email/helpers'

const html = getWelcomeEmailHTML({
  firstName: 'Test',
  dashboardUrl: 'https://example.com'
})

// Check for color values in the HTML
const hasBlackHeadings = html.includes('color: #000000')
const hasLightGray = html.includes('color: #999') || html.includes('color: #ccc')

console.log('HTML Preview (first 2000 chars):')
console.log(html.substring(0, 2000))
console.log('\n---')
console.log('Has black text (#000000):', hasBlackHeadings)
console.log('Has problematic light gray:', hasLightGray)

// Find all color declarations
const colorMatches = html.match(/color:\s*#[0-9a-f]{3,6}/gi) || []
console.log('\nAll color declarations found:')
colorMatches.forEach((color, i) => {
  if (i < 20) console.log(`  ${i + 1}. ${color}`)
})
