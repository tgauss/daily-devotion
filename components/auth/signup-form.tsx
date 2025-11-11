'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
// import { GoogleSignInButton } from './google-sign-in-button' // Hidden until Google OAuth is configured

export function SignupForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const searchParams = useSearchParams()

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
      // Use custom signup API that sends verification via Resend
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          referralCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      setMessage({
        type: 'success',
        text: data.message || 'Account created! Please check your email to verify your address.',
      })

      // Clear form
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
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
        Create Your Account
      </h2>
      <p className="text-sm text-charcoal/60 text-center mb-6 font-sans">
        Start growing in faith today
      </p>

      {referralCode && (
        <div className="mb-6 p-4 bg-golden-wheat/10 border border-golden-wheat/30 rounded-lg">
          <p className="text-sm text-charcoal font-sans text-center">
            You've been invited to join My Daily Bread!
          </p>
        </div>
      )}

      {/* Google Sign In - Hidden until configured */}
      {/* <div className="mb-6">
        <GoogleSignInButton />
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-olivewood/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white/90 text-charcoal/60 font-sans">Or sign up with email</span>
        </div>
      </div> */}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-charcoal mb-2 font-sans">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-olivewood/30 rounded-md text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-golden-wheat focus:border-transparent font-sans transition-all"
              placeholder="John"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-charcoal mb-2 font-sans">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-olivewood/30 rounded-md text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-golden-wheat focus:border-transparent font-sans transition-all"
              placeholder="Doe"
            />
          </div>
        </div>

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
            placeholder="At least 6 characters"
          />
          <p className="text-xs text-charcoal/50 font-sans mt-1">Minimum 6 characters</p>
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
          {loading ? 'Creating your account...' : 'Create Account'}
        </button>

        <p className="text-xs text-charcoal/60 text-center font-sans">
          By signing up, you agree to grow in faith and receive spiritual nourishment daily.
        </p>
      </form>
    </div>
  )
}
