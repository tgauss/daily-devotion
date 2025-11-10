'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Loader2, CheckCircle2, PlayCircle, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { BatchLessonGenerator } from './batch-lesson-generator'
import { SingleLessonGenerator } from './single-lesson-generator'

interface PlanDetailsProps {
  plan: any
  userId: string | null
  progress: any
}

type LessonStatus = 'overdue' | 'today' | 'thisWeek' | 'later'

interface CategorizedLessons {
  overdue: any[]
  today: any[]
  thisWeek: any[]
  later: any[]
}

export function PlanDetails({ plan, userId, progress }: PlanDetailsProps) {
  const [buildingItemId, setBuildingItemId] = useState<string | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    later: true, // Later section collapsed by default
  })

  const handleGenerationComplete = () => {
    // Reload the page to show newly built lessons
    window.location.reload()
  }

  const buildSpecificLesson = async (planItemId: string) => {
    setBuildingItemId(planItemId)

    try {
      const response = await fetch('/api/lessons/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planItemId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to build lesson')
      }

      // Reload to show the newly built lesson
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      alert(`Error: ${err.message}`)
      setBuildingItemId(null)
    }
  }

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const sortedItems = [...plan.plan_items].sort((a: any, b: any) => a.index - b.index)

  // Helper to check if lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    if (!progress) return false
    return progress.some((p: any) => p.lesson_id === lessonId && p.completed_at)
  }

  // Helper to get completion date
  const getCompletionDate = (lessonId: string) => {
    if (!progress) return null
    const progressItem = progress.find((p: any) => p.lesson_id === lessonId && p.completed_at)
    return progressItem?.completed_at
  }

  // Helper to calculate days offset from today
  const getDaysOffset = (dateTarget: string | null): number | null => {
    if (!dateTarget) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateTarget)
    target.setHours(0, 0, 0, 0)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Categorize lessons into groups
  const categorizeLessons = (): CategorizedLessons => {
    const categories: CategorizedLessons = {
      overdue: [],
      today: [],
      thisWeek: [],
      later: [],
    }

    sortedItems.forEach((item: any) => {
      const lesson = item.plan_item_lessons?.[0]?.lessons
      const isCompleted = lesson && isLessonCompleted(lesson.id)

      // Skip completed lessons for grouping (they'll show in their date sections but dimmed)
      const daysOffset = getDaysOffset(item.date_target)

      if (daysOffset === null) {
        categories.later.push(item)
      } else if (daysOffset < 0 && !isCompleted) {
        categories.overdue.push(item)
      } else if (daysOffset === 0) {
        categories.today.push(item)
      } else if (daysOffset > 0 && daysOffset <= 7) {
        categories.thisWeek.push(item)
      } else {
        categories.later.push(item)
      }
    })

    return categories
  }

  // Find next incomplete lesson (for Jump In card)
  const findNextIncomplete = () => {
    for (const item of sortedItems) {
      const lesson = item.plan_item_lessons?.[0]?.lessons
      if (!lesson) continue
      if (isLessonCompleted(lesson.id)) continue

      const daysOffset = getDaysOffset(item.date_target)
      if (daysOffset !== null && daysOffset <= 0) {
        return item
      }
    }
    return null
  }

  // Count completed lessons
  const completedCount = sortedItems.filter((item: any) => {
    const lesson = item.plan_item_lessons?.[0]?.lessons
    return lesson && isLessonCompleted(lesson.id)
  }).length

  const categorized = categorizeLessons()
  const nextIncomplete = findNextIncomplete()
  const overdueCount = categorized.overdue.length

  // Calculate overall progress percentage
  const progressPercent = sortedItems.length > 0
    ? Math.round((completedCount / sortedItems.length) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Plan header */}
      <div className="bg-white/90 rounded-lg p-8 shadow-lg border border-olivewood/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-charcoal mb-3 font-heading">{plan.title}</h1>
            {plan.description && (
              <p className="text-charcoal/70 mb-6 text-lg font-sans leading-relaxed">{plan.description}</p>
            )}
            <div className="flex gap-3 flex-wrap">
              <span className="px-4 py-2 bg-sandstone text-olivewood text-sm rounded-md border border-olivewood/30 font-sans">
                {plan.schedule_type}
              </span>
              {plan.theme && (
                <span className="px-4 py-2 bg-sandstone text-olivewood text-sm rounded-md border border-olivewood/30 font-sans">
                  {plan.theme}
                </span>
              )}
              {plan.is_public && (
                <span className="px-4 py-2 bg-sandstone text-olivewood text-sm rounded-md border border-olivewood/30 font-sans">
                  Public
                </span>
              )}
              {progress && (
                <span className="px-4 py-2 bg-olivewood/10 text-olivewood text-sm rounded-md border border-olivewood/30 font-sans font-semibold">
                  {completedCount} / {sortedItems.length} completed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lesson building options */}
        {plan.user_id === userId && (
          <div className="space-y-6">
            <div className="border-t border-olivewood/20 pt-6">
              <h3 className="text-lg font-semibold text-charcoal mb-4 font-heading">
                Quick Build
              </h3>
              <SingleLessonGenerator planId={plan.id} onComplete={handleGenerationComplete} />
            </div>

            <div className="border-t border-olivewood/20 pt-6">
              <h3 className="text-lg font-semibold text-charcoal mb-4 font-heading">
                Batch Build
              </h3>
              <BatchLessonGenerator planId={plan.id} onComplete={handleGenerationComplete} />
            </div>
          </div>
        )}
      </div>

      {/* Lessons list */}
      <div className="bg-white/90 rounded-lg p-8 shadow-lg border border-olivewood/20">
        <h2 className="text-3xl font-bold text-charcoal mb-8 font-heading">Your Reading Journey</h2>

        {/* Jump In Card */}
        {nextIncomplete && (
          <div className="mb-8 bg-gradient-to-r from-golden-wheat/20 via-golden-wheat/10 to-transparent rounded-xl p-6 border-2 border-golden-wheat/40 shadow-md">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-golden-wheat/30 border-2 border-golden-wheat flex items-center justify-center">
                <PlayCircle className="w-8 h-8 text-golden-wheat" strokeWidth={2.5} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-heading font-bold text-charcoal">Jump In</h3>
                  {overdueCount > 0 && (
                    <span className="px-3 py-1 bg-clay-rose text-white text-xs rounded-md font-sans font-semibold">
                      {overdueCount} overdue
                    </span>
                  )}
                </div>
                <p className="text-lg text-charcoal font-sans mb-1">
                  {nextIncomplete.references_text.join(', ')}
                </p>
                <p className="text-sm text-charcoal/60 font-sans">
                  {getDaysOffset(nextIncomplete.date_target) === 0
                    ? 'Due today'
                    : `${Math.abs(getDaysOffset(nextIncomplete.date_target) || 0)} days overdue`}
                </p>

                {/* Progress bar */}
                <div className="mt-4 mb-2">
                  <div className="flex justify-between text-xs text-charcoal/60 font-sans mb-1">
                    <span>Overall Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-sandstone rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-olivewood to-golden-wheat transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <Link
                href={`/s/${nextIncomplete.plan_item_lessons?.[0]?.lessons?.share_slug}`}
                className="flex-shrink-0 px-8 py-4 bg-golden-wheat hover:bg-golden-wheat/90 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg font-sans text-lg"
              >
                Continue Reading
              </Link>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Overdue Section */}
          {categorized.overdue.length > 0 && (
            <LessonSection
              title="Overdue"
              items={categorized.overdue}
              sectionKey="overdue"
              collapsed={collapsedSections.overdue || false}
              onToggle={() => toggleSection('overdue')}
              userId={userId}
              progress={progress}
              isLessonCompleted={isLessonCompleted}
              getCompletionDate={getCompletionDate}
              getDaysOffset={getDaysOffset}
              buildSpecificLesson={buildSpecificLesson}
              buildingItemId={buildingItemId}
              plan={plan}
            />
          )}

          {/* Today Section */}
          {categorized.today.length > 0 && (
            <LessonSection
              title="Today"
              items={categorized.today}
              sectionKey="today"
              collapsed={false}
              onToggle={() => {}}
              userId={userId}
              progress={progress}
              isLessonCompleted={isLessonCompleted}
              getCompletionDate={getCompletionDate}
              getDaysOffset={getDaysOffset}
              buildSpecificLesson={buildSpecificLesson}
              buildingItemId={buildingItemId}
              plan={plan}
            />
          )}

          {/* This Week Section */}
          {categorized.thisWeek.length > 0 && (
            <LessonSection
              title="This Week"
              items={categorized.thisWeek}
              sectionKey="thisWeek"
              collapsed={collapsedSections.thisWeek || false}
              onToggle={() => toggleSection('thisWeek')}
              userId={userId}
              progress={progress}
              isLessonCompleted={isLessonCompleted}
              getCompletionDate={getCompletionDate}
              getDaysOffset={getDaysOffset}
              buildSpecificLesson={buildSpecificLesson}
              buildingItemId={buildingItemId}
              plan={plan}
            />
          )}

          {/* Later Section */}
          {categorized.later.length > 0 && (
            <LessonSection
              title="Later"
              items={categorized.later}
              sectionKey="later"
              collapsed={collapsedSections.later || false}
              onToggle={() => toggleSection('later')}
              userId={userId}
              progress={progress}
              isLessonCompleted={isLessonCompleted}
              getCompletionDate={getCompletionDate}
              getDaysOffset={getDaysOffset}
              buildSpecificLesson={buildSpecificLesson}
              buildingItemId={buildingItemId}
              plan={plan}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Lesson Section Component
interface LessonSectionProps {
  title: string
  items: any[]
  sectionKey: string
  collapsed: boolean
  onToggle: () => void
  userId: string | null
  progress: any
  isLessonCompleted: (id: string) => boolean
  getCompletionDate: (id: string) => string | null
  getDaysOffset: (date: string | null) => number | null
  buildSpecificLesson: (id: string) => void
  buildingItemId: string | null
  plan: any
}

function LessonSection({
  title,
  items,
  sectionKey,
  collapsed,
  onToggle,
  userId,
  progress,
  isLessonCompleted,
  getCompletionDate,
  getDaysOffset,
  buildSpecificLesson,
  buildingItemId,
  plan,
}: LessonSectionProps) {
  const completedInSection = items.filter(item => {
    const lesson = item.plan_item_lessons?.[0]?.lessons
    return lesson && isLessonCompleted(lesson.id)
  }).length

  const sectionColors = {
    overdue: {
      bg: 'bg-clay-rose/10',
      border: 'border-clay-rose/30',
      text: 'text-clay-rose',
      badge: 'bg-clay-rose',
    },
    today: {
      bg: 'bg-golden-wheat/10',
      border: 'border-golden-wheat/30',
      text: 'text-golden-wheat',
      badge: 'bg-golden-wheat',
    },
    thisWeek: {
      bg: 'bg-olivewood/5',
      border: 'border-olivewood/20',
      text: 'text-olivewood',
      badge: 'bg-olivewood',
    },
    later: {
      bg: 'bg-charcoal/5',
      border: 'border-charcoal/10',
      text: 'text-charcoal/60',
      badge: 'bg-charcoal/60',
    },
  }

  const colors = sectionColors[sectionKey as keyof typeof sectionColors] || sectionColors.later

  return (
    <div className={`rounded-lg border ${colors.border} overflow-hidden`}>
      {/* Section Header */}
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 ${colors.bg} flex items-center justify-between hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-4">
          <h3 className={`text-xl font-heading font-bold ${colors.text}`}>
            {title}
          </h3>
          <span className={`px-3 py-1 ${colors.badge} text-white text-xs rounded-md font-sans font-semibold`}>
            {completedInSection} / {items.length}
          </span>
        </div>
        {collapsed ? (
          <ChevronDown className={`w-5 h-5 ${colors.text}`} />
        ) : (
          <ChevronUp className={`w-5 h-5 ${colors.text}`} />
        )}
      </button>

      {/* Section Content */}
      {!collapsed && (
        <div className="p-4 space-y-3 bg-white/50">
          {items.map((item: any, index: number) => {
            const lesson = item.plan_item_lessons?.[0]?.lessons
            const hasLesson = !!lesson
            const isCompleted = lesson && isLessonCompleted(lesson.id)
            const completionDate = lesson && getCompletionDate(lesson.id)
            const daysOffset = getDaysOffset(item.date_target)

            // Format time label
            let timeLabel = ''
            if (isCompleted && completionDate) {
              const completed = new Date(completionDate)
              const diffMs = Date.now() - completed.getTime()
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
              if (diffDays === 0) timeLabel = 'Completed today'
              else if (diffDays === 1) timeLabel = 'Completed yesterday'
              else timeLabel = `Completed ${diffDays} days ago`
            } else if (daysOffset !== null) {
              if (daysOffset === 0) timeLabel = 'Due today'
              else if (daysOffset < 0) timeLabel = `${Math.abs(daysOffset)} ${Math.abs(daysOffset) === 1 ? 'day' : 'days'} overdue`
              else timeLabel = `Due in ${daysOffset} ${daysOffset === 1 ? 'day' : 'days'}`
            }

            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  isCompleted
                    ? 'bg-white/30 border-olivewood/10 opacity-60'
                    : sectionKey === 'overdue'
                    ? 'bg-clay-rose/5 border-clay-rose/20 hover:border-clay-rose/40'
                    : sectionKey === 'today'
                    ? 'bg-golden-wheat/5 border-golden-wheat/20 hover:border-golden-wheat/40'
                    : 'bg-white border-olivewood/10 hover:border-olivewood/20'
                }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border ${
                  isCompleted
                    ? 'bg-olivewood/20 border-olivewood'
                    : sectionKey === 'overdue'
                    ? 'bg-clay-rose/20 border-clay-rose'
                    : sectionKey === 'today'
                    ? 'bg-golden-wheat/20 border-golden-wheat'
                    : 'bg-sandstone border-olivewood/20'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-olivewood" />
                  ) : sectionKey === 'overdue' ? (
                    <AlertCircle className="w-5 h-5 text-clay-rose" />
                  ) : (
                    <Clock className="w-5 h-5 text-charcoal/40" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-charcoal font-medium font-sans">
                      {item.references_text.join(', ')}
                    </p>
                    {item.category && (
                      <span className="px-2 py-0.5 bg-clay-rose/20 text-olivewood text-xs rounded font-sans">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal/60 font-sans">
                    {timeLabel}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasLesson ? (
                    <Link
                      href={`/s/${lesson.share_slug}`}
                      className={`px-4 py-2 rounded-md border transition-colors font-sans text-sm font-medium ${
                        sectionKey === 'today'
                          ? 'bg-golden-wheat hover:bg-golden-wheat/90 text-white border-golden-wheat/50'
                          : isCompleted
                          ? 'bg-olivewood/10 hover:bg-olivewood/20 text-olivewood border-olivewood/30'
                          : 'bg-olivewood hover:bg-olivewood/90 text-white border-olivewood/50'
                      }`}
                    >
                      {isCompleted ? 'Review' : sectionKey === 'today' ? 'Start' : 'View'}
                    </Link>
                  ) : (
                    <>
                      {plan.user_id === userId ? (
                        <button
                          onClick={() => buildSpecificLesson(item.id)}
                          disabled={buildingItemId === item.id}
                          className="px-4 py-2 bg-golden-wheat hover:bg-golden-wheat/90 disabled:bg-golden-wheat/50 text-charcoal text-sm font-medium rounded-md border border-golden-wheat/50 transition-colors font-sans flex items-center gap-2"
                        >
                          {buildingItemId === item.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Building...
                            </>
                          ) : (
                            'Build'
                          )}
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-clay-rose/10 text-charcoal/50 text-xs rounded-md border border-charcoal/10 font-sans">
                          Not ready
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
