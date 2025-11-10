'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Star, Users, BookOpen, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface LibraryBrowserProps {
  userId: string
}

interface PlanWithStats {
  id: string
  title: string
  description: string | null
  theme: string | null
  depth_level: 'simple' | 'moderate' | 'deep'
  schedule_type: 'daily' | 'weekly'
  featured: boolean
  created_by_name: string | null
  created_at: string
  plan_library_stats: {
    participant_count: number
    completion_count: number
  } | null
}

export function LibraryBrowser({ userId }: LibraryBrowserProps) {
  const router = useRouter()
  const [featuredPlans, setFeaturedPlans] = useState<PlanWithStats[]>([])
  const [allPlans, setAllPlans] = useState<PlanWithStats[]>([])
  const [filteredPlans, setFilteredPlans] = useState<PlanWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [depthFilter, setDepthFilter] = useState<'all' | 'simple' | 'moderate' | 'deep'>('all')

  useEffect(() => {
    fetchPlans()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, depthFilter, allPlans])

  const fetchPlans = async () => {
    setLoading(true)
    try {
      // Fetch featured plans
      const featuredResponse = await fetch('/api/plans/library?featured=true&limit=10')
      const featuredData = await featuredResponse.json()
      setFeaturedPlans(featuredData.plans || [])

      // Fetch all plans
      const allResponse = await fetch('/api/plans/library?limit=50')
      const allData = await allResponse.json()
      setAllPlans(allData.plans || [])
      setFilteredPlans(allData.plans || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...allPlans]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (plan) =>
          plan.title.toLowerCase().includes(query) ||
          plan.description?.toLowerCase().includes(query) ||
          plan.theme?.toLowerCase().includes(query)
      )
    }

    // Apply depth filter
    if (depthFilter !== 'all') {
      filtered = filtered.filter((plan) => plan.depth_level === depthFilter)
    }

    setFilteredPlans(filtered)
  }

  const handleJoinPlan = async (planId: string) => {
    // For public library plans, we'll redirect to a preview page
    router.push(`/library/${planId}`)
  }

  const getDepthLabel = (depth: string) => {
    switch (depth) {
      case 'simple':
        return '5-7 min'
      case 'moderate':
        return '10-12 min'
      case 'deep':
        return '15-20 min'
      default:
        return ''
    }
  }

  const PlanCard = ({ plan, isFeatured = false }: { plan: PlanWithStats; isFeatured?: boolean }) => (
    <div
      className={`
        relative p-6 bg-white rounded-lg border-2 transition-all cursor-pointer group
        ${isFeatured ? 'border-golden-wheat shadow-lg hover:shadow-xl' : 'border-olivewood/20 hover:border-olivewood/40 hover:shadow-md'}
      `}
      onClick={() => handleJoinPlan(plan.id)}
    >
      {isFeatured && (
        <div className="absolute -top-3 left-4 px-3 py-1 bg-gradient-to-r from-golden-wheat to-olivewood text-white text-xs font-semibold rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          Featured
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-heading font-bold text-charcoal mb-2 group-hover:text-olivewood transition-colors">
            {plan.title}
          </h3>
          {plan.description && (
            <p className="text-sm text-charcoal/70 font-sans line-clamp-2">{plan.description}</p>
          )}
        </div>

        {plan.theme && (
          <div className="inline-block px-3 py-1 bg-olivewood/10 text-olivewood text-xs font-medium rounded-full">
            {plan.theme}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-charcoal/60 font-sans">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{getDepthLabel(plan.depth_level)}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span className="capitalize">{plan.schedule_type}</span>
          </div>
          {plan.plan_library_stats && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{plan.plan_library_stats.participant_count} joined</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-charcoal mb-2">Plan Library</h1>
        <p className="text-lg text-charcoal/70 font-sans">
          Discover and join Bible study plans created by the community
        </p>
      </div>

      {/* Featured Section */}
      {!loading && featuredPlans.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-charcoal mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-golden-wheat fill-current" />
            Featured Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPlans.slice(0, 6).map((plan) => (
              <PlanCard key={plan.id} plan={plan} isFeatured />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
            <input
              type="text"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-olivewood/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-olivewood/50 focus:border-olivewood font-sans"
            />
          </div>

          {/* Depth Filter */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Filter className="w-5 h-5 text-charcoal/60" />
            <select
              value={depthFilter}
              onChange={(e) => setDepthFilter(e.target.value as any)}
              className="px-4 py-3 border-2 border-olivewood/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-olivewood/50 focus:border-olivewood font-sans bg-white"
            >
              <option value="all">All Depths</option>
              <option value="simple">Simple (5-7 min)</option>
              <option value="moderate">Moderate (10-12 min)</option>
              <option value="deep">Deep (15-20 min)</option>
            </select>
          </div>
        </div>
      </div>

      {/* All Plans */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-charcoal mb-6">
          All Plans ({filteredPlans.length})
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-olivewood"></div>
            <p className="mt-4 text-charcoal/60 font-sans">Loading plans...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-olivewood/20">
            <BookOpen className="w-16 h-16 text-charcoal/30 mx-auto mb-4" />
            <p className="text-lg text-charcoal/60 font-sans">No plans found</p>
            <p className="text-sm text-charcoal/50 font-sans mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>

      {/* Link back to create */}
      <div className="mt-12 text-center">
        <p className="text-charcoal/60 font-sans mb-4">Don't see what you're looking for?</p>
        <Link
          href="/plans/wizard"
          className="inline-block px-8 py-3 bg-gradient-to-r from-olivewood to-golden-wheat hover:opacity-90 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg font-sans"
        >
          Create Your Own Plan
        </Link>
      </div>
    </div>
  )
}
