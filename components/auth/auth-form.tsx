'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Capture referral code from URL on mount
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref)
      console.log('Referral code detected:', ref)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        setMessage({ type: 'success', text: 'Logged in successfully!' })
        router.push('/dashboard')
        router.refresh()
      } else {
        // Sign up with referral tracking
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              referred_by_code: referralCode, // Store in metadata for trigger to process
            },
          },
        })

        if (error) throw error

        // If referral code present, update the user after creation
        if (referralCode && data.user) {
          try {
            // Look up referrer by code
            const { data: referrer } = await supabase
              .from('users')
              .select('id')
              .eq('referral_code', referralCode)
              .single()

            if (referrer) {
              // Update new user's referred_by field
              await supabase
                .from('users')
                .update({ referred_by_user_id: referrer.id })
                .eq('id', data.user.id)
            }
          } catch (error) {
            console.error('Error tracking referral:', error)
            // Don't fail signup if referral tracking fails
          }
        }

        setMessage({
          type: 'success',
          text: 'Account created! Please check your email to confirm.',
        })
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/90 rounded-lg p-8 shadow-lg border border-olivewood/20">
      <h2 className="text-2xl font-heading text-charcoal mb-2 text-center">
        {isLogin ? 'Welcome back' : 'Begin your journey'}
      </h2>
      <p className="text-sm text-charcoal/60 text-center mb-8 font-sans">
        {isLogin ? "Ready for today's reading?" : "Start your daily practice"}
      </p>

      {referralCode && !isLogin && (
        <div className="mb-6 p-4 bg-golden-wheat/10 border border-golden-wheat/30 rounded-lg">
          <p className="text-sm text-charcoal font-sans text-center">
            You've been invited to join My Daily Bread! 🎉
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2 font-sans">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white border border-olivewood/30 rounded-md text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-golden-wheat focus:border-transparent font-sans transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2 font-sans">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 bg-white border border-olivewood/30 rounded-md text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-golden-wheat focus:border-transparent font-sans transition-all"
            placeholder="••••••••"
          />
        </div>

        {message && (
          <div
            className={`p-4 rounded-md text-sm font-sans ${
              message.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-golden-wheat/10 text-charcoal border border-golden-wheat/30'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-olivewood hover:bg-olivewood/90 disabled:bg-olivewood/50 text-white font-medium rounded-md border border-olivewood/50 transition-all shadow-sm hover:shadow font-sans"
        >
          {loading ? 'Just a moment...' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin)
            setMessage(null)
          }}
          className="text-olivewood hover:text-golden-wheat text-sm transition-colors font-sans"
        >
          {isLogin ? "New here? Create an account" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
