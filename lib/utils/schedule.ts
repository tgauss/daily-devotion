/**
 * Scheduling utilities for flexible plan dates
 * Handles both synchronized (group study) and self-guided (personal pace) plans
 */

export type ScheduleMode = 'self-guided' | 'synchronized'
export type ScheduleType = 'daily' | 'weekly'

export interface PlanSchedule {
  schedule_mode: ScheduleMode
  schedule_type: ScheduleType
}

export interface Enrollment {
  custom_start_date: string | null
}

export interface PlanItem {
  index: number
  date_target: string | null
}

/**
 * Calculate the effective due date for a plan item based on enrollment
 *
 * @param plan - Plan with schedule_mode and schedule_type
 * @param enrollment - User's enrollment with optional custom_start_date
 * @param item - Plan item with index and original date_target
 * @returns Effective date string (YYYY-MM-DD) or null for self-paced
 */
export function getEffectiveDate(
  plan: PlanSchedule,
  enrollment: Enrollment | null,
  item: PlanItem
): string | null {
  // For synchronized plans, use the original date
  if (plan.schedule_mode === 'synchronized') {
    return item.date_target
  }

  // For self-guided plans, calculate from custom start date
  if (!enrollment?.custom_start_date) {
    // No custom start date = pure self-paced (no dates)
    return null
  }

  // Calculate interval based on schedule type
  const intervalDays = plan.schedule_type === 'weekly' ? 7 : 1

  // Parse date with explicit UTC handling to avoid timezone issues
  // Format: YYYY-MM-DD (e.g., "2025-11-12")
  const dateParts = enrollment.custom_start_date.split('-')
  const year = parseInt(dateParts[0], 10)
  const month = parseInt(dateParts[1], 10) - 1 // JavaScript months are 0-indexed
  const day = parseInt(dateParts[2], 10)

  const startDate = new Date(year, month, day)

  // Validate the date
  if (isNaN(startDate.getTime())) {
    console.error('[Schedule] Invalid start date:', {
      custom_start_date: enrollment.custom_start_date,
      parsed: { year, month, day }
    })
    return null
  }

  // Calculate effective date by adding interval days
  const effectiveDate = new Date(startDate)
  effectiveDate.setDate(startDate.getDate() + (item.index * intervalDays))

  // Validate the calculated date
  if (isNaN(effectiveDate.getTime())) {
    console.error('[Schedule] Invalid effective date calculation:', {
      startDate: startDate.toISOString(),
      index: item.index,
      intervalDays,
      daysToAdd: item.index * intervalDays
    })
    return null
  }

  return effectiveDate.toISOString().split('T')[0]
}

/**
 * Calculate all effective dates for plan items
 *
 * @param plan - Plan with schedule info
 * @param enrollment - User's enrollment
 * @param items - Array of plan items
 * @returns Array of effective dates (same order as items)
 */
export function getEffectiveDates(
  plan: PlanSchedule,
  enrollment: Enrollment | null,
  items: PlanItem[]
): (string | null)[] {
  return items.map((item) => getEffectiveDate(plan, enrollment, item))
}

/**
 * Calculate estimated completion date for a plan
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param itemCount - Number of lessons in plan
 * @param scheduleType - daily or weekly
 * @returns Estimated end date string
 */
export function calculateCompletionDate(
  startDate: string,
  itemCount: number,
  scheduleType: ScheduleType
): string {
  const start = new Date(startDate)
  const intervalDays = scheduleType === 'weekly' ? 7 : 1
  const endDate = new Date(start)
  endDate.setDate(start.getDate() + ((itemCount - 1) * intervalDays))

  return endDate.toISOString().split('T')[0]
}

/**
 * Format a date for display
 * Examples: "Today", "Tomorrow", "Jan 15", "Jan 15, 2026"
 */
export function formatDateForDisplay(dateStr: string | null): string {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  if (targetDate.getTime() === today.getTime()) {
    return 'Today'
  }

  if (targetDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  }

  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()
  const currentYear = today.getFullYear()

  // Show year if different from current year
  if (year !== currentYear) {
    return `${month} ${day}, ${year}`
  }

  return `${month} ${day}`
}

/**
 * Get days offset from today (negative = overdue, 0 = today, positive = future)
 */
export function getDaysOffset(dateStr: string | null): number | null {
  if (!dateStr) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(dateStr)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Get user-friendly description of schedule mode
 */
export function getScheduleModeDescription(mode: ScheduleMode): string {
  switch (mode) {
    case 'synchronized':
      return 'Everyone studies together on the same schedule'
    case 'self-guided':
      return 'Study at your own pace, starting when you choose'
    default:
      return ''
  }
}

/**
 * Get icon/emoji for schedule mode
 */
export function getScheduleModeIcon(mode: ScheduleMode): string {
  switch (mode) {
    case 'synchronized':
      return '👥' // People together
    case 'self-guided':
      return '🎯' // Personal goal
    default:
      return ''
  }
}
