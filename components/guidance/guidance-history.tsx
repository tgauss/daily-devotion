'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SpiritualGuidance } from '@/lib/types/database'

interface GuidanceHistoryProps {
  initialGuidance?: SpiritualGuidance[]
}

export function GuidanceHistory({ initialGuidance = [] }: GuidanceHistoryProps) {
  const [guidanceList, setGuidanceList] = useState<SpiritualGuidance[]>(initialGuidance)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()

  // Fetch guidance history
  const fetchGuidance = async (pageNum: number = 1, search: string = '') => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(search && { search }),
      })

      const response = await fetch(`/api/guidance/list?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch guidance history')
      }

      if (pageNum === 1) {
        setGuidanceList(data.data)
      } else {
        setGuidanceList((prev) => [...prev, ...data.data])
      }

      setHasMore(data.pagination.hasNextPage)
      setPage(pageNum)
    } catch (err: any) {
      console.error('Error fetching guidance:', err)
      setError(err.message || 'Failed to load guidance history')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    if (initialGuidance.length === 0) {
      fetchGuidance()
    }
  }, [])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchGuidance(1, searchQuery)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    fetchGuidance(1, '')
  }

  const handleLoadMore = () => {
    fetchGuidance(page + 1, searchQuery)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guidance? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/guidance/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete guidance')
      }

      // Remove from list
      setGuidanceList((prev) => prev.filter((g) => g.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete guidance')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your guidance history..."
          className="flex-1 px-5 py-3 bg-white border border-olivewood/30 rounded-lg text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-olivewood/50 font-sans"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-olivewood hover:bg-olivewood/90 disabled:bg-olivewood/50 text-white font-medium rounded-lg transition-colors font-sans"
        >
          Search
        </button>
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="px-4 py-3 bg-clay-rose/20 hover:bg-clay-rose/30 text-charcoal rounded-lg transition-colors font-sans"
          >
            Clear
          </button>
        )}
      </form>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-md text-sm font-sans bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      {/* Guidance list */}
      {guidanceList.length === 0 && !loading ? (
        <div className="text-center py-12 px-6">
          <div className="max-w-md mx-auto">
            {searchQuery ? (
              <>
                <svg
                  className="w-16 h-16 text-charcoal/20 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-charcoal/70 font-sans text-lg mb-2">No guidance found</p>
                <p className="text-charcoal/50 font-sans text-sm">
                  Try a different search term or clear your search to see all guidance.
                </p>
              </>
            ) : (
              <>
                <svg
                  className="w-16 h-16 text-olivewood/40 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p className="text-charcoal/70 font-sans text-lg mb-2">Your guidance journey starts here</p>
                <p className="text-charcoal/50 font-sans text-sm mb-6 leading-relaxed">
                  Share what's on your heart above, and we'll help you find Scripture and wisdom for your situation.
                  All guidance is private to you.
                </p>
                <p className="text-xs text-charcoal/40 font-sans italic">
                  "Your word is a lamp to my feet and a light to my path." — Psalm 119:105
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {guidanceList.map((guidance) => (
            <div
              key={guidance.id}
              className="bg-white/90 backdrop-blur-lg rounded-lg p-6 shadow-lg border border-olivewood/20 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => router.push(`/guidance/${guidance.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-charcoal/60 font-sans">
                      {formatDate(guidance.created_at)}
                    </p>
                    <span className="px-2 py-1 bg-olivewood/10 rounded text-xs text-olivewood font-sans font-medium">
                      {guidance.passages.length} passages
                    </span>
                  </div>

                  <p className="text-charcoal/90 font-sans leading-relaxed">
                    {truncateText(guidance.situation_text, 150)}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {guidance.passages.slice(0, 3).map((passage, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-golden-wheat/20 rounded-full text-xs text-charcoal/70 font-sans"
                      >
                        {passage.reference}
                      </span>
                    ))}
                    {guidance.passages.length > 3 && (
                      <span className="px-3 py-1 bg-clay-rose/20 rounded-full text-xs text-charcoal/60 font-sans">
                        +{guidance.passages.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(guidance.id)
                  }}
                  className="flex-shrink-0 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-sans text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more button */}
      {hasMore && guidanceList.length > 0 && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-sandstone hover:bg-clay-rose/30 disabled:bg-sandstone/50 text-charcoal border border-olivewood/30 rounded-lg transition-colors font-sans font-medium"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Loading spinner */}
      {loading && guidanceList.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-olivewood"></div>
          <p className="mt-4 text-charcoal/60 font-sans">Loading your guidance history...</p>
        </div>
      )}
    </div>
  )
}
