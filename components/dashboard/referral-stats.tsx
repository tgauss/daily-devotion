'use client'

import { useState, useEffect } from 'react'
import { Share2, Copy, Check, Users } from 'lucide-react'

interface ReferralStats {
  referral_code: string | null
  total_referrals: number
  active_referrals: number
  referral_link: string | null
}

export function ReferralStats() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReferralStats()
  }, [])

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/referrals/stats')
      if (!response.ok) throw new Error('Failed to fetch referral stats')

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching referral stats:', error)
      setError('Could not load referral stats')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!stats?.referral_link) return

    try {
      await navigator.clipboard.writeText(stats.referral_link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-olivewood/20 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return null // Fail silently
  }

  return (
    <div className="bg-gradient-to-br from-olivewood/5 to-golden-wheat/5 rounded-lg shadow-sm border border-olivewood/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="h-5 w-5 text-olivewood" />
        <h3 className="text-lg font-heading font-semibold text-charcoal">Share My Daily Bread</h3>
      </div>

      <p className="text-sm text-charcoal/70 mb-4 font-sans">
        Invite friends to join your spiritual journey. Share your unique link below.
      </p>

      {/* Referral Link */}
      {stats.referral_link && (
        <div className="bg-white rounded-lg border border-olivewood/30 p-4 mb-4">
          <label className="block text-xs font-medium text-charcoal/60 mb-2 font-sans uppercase tracking-wide">
            Your Referral Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={stats.referral_link}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-charcoal font-mono focus:outline-none focus:ring-2 focus:ring-golden-wheat"
              onClick={(e) => e.currentTarget.select()}
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-olivewood hover:bg-olivewood/90 text-white rounded-lg transition-colors flex items-center gap-2 font-sans"
              title="Copy link"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-olivewood/20 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-olivewood" />
            <span className="text-xs font-medium text-charcoal/60 font-sans uppercase tracking-wide">
              Total Referrals
            </span>
          </div>
          <p className="text-2xl font-heading font-bold text-charcoal">{stats.total_referrals}</p>
        </div>

        <div className="bg-white rounded-lg border border-olivewood/20 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-golden-wheat" />
            <span className="text-xs font-medium text-charcoal/60 font-sans uppercase tracking-wide">
              Recent (30d)
            </span>
          </div>
          <p className="text-2xl font-heading font-bold text-charcoal">{stats.active_referrals}</p>
        </div>
      </div>

      {stats.total_referrals > 0 && (
        <div className="mt-4 p-3 bg-golden-wheat/10 border border-golden-wheat/30 rounded-lg">
          <p className="text-sm text-charcoal font-sans text-center">
            Thank you for sharing the Word! 🙏
          </p>
        </div>
      )}
    </div>
  )
}
