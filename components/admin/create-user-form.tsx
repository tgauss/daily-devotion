'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CreateUserForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    preloadFortWorth: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create user')
      }

      const result = await response.json()
      setSuccess(`User created successfully! ${result.lessonsCopied > 0 ? `${result.lessonsCopied} lessons pre-loaded.` : ''}`)

      // Reset form
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        preloadFortWorth: false,
      })

      // Refresh the page to show new user in list
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2 font-sans">
          Email *
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-clay-rose/30 rounded-md focus:ring-2 focus:ring-olivewood focus:border-transparent font-sans text-charcoal"
          placeholder="user@example.com"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2 font-sans">
          Password *
        </label>
        <input
          type="password"
          id="password"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-2 border border-clay-rose/30 rounded-md focus:ring-2 focus:ring-olivewood focus:border-transparent font-sans text-charcoal"
          placeholder="Minimum 6 characters"
        />
      </div>

      {/* First Name */}
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-charcoal mb-2 font-sans">
          First Name
        </label>
        <input
          type="text"
          id="first_name"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          className="w-full px-4 py-2 border border-clay-rose/30 rounded-md focus:ring-2 focus:ring-olivewood focus:border-transparent font-sans text-charcoal"
          placeholder="John"
        />
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-charcoal mb-2 font-sans">
          Last Name
        </label>
        <input
          type="text"
          id="last_name"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          className="w-full px-4 py-2 border border-clay-rose/30 rounded-md focus:ring-2 focus:ring-olivewood focus:border-transparent font-sans text-charcoal"
          placeholder="Doe"
        />
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone_number" className="block text-sm font-medium text-charcoal mb-2 font-sans">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone_number"
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          className="w-full px-4 py-2 border border-clay-rose/30 rounded-md focus:ring-2 focus:ring-olivewood focus:border-transparent font-sans text-charcoal"
          placeholder="(555) 123-4567"
        />
      </div>

      {/* Pre-load Fort Worth Plan */}
      <div className="bg-clay-rose/10 border border-clay-rose/30 rounded-md p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.preloadFortWorth}
            onChange={(e) => setFormData({ ...formData, preloadFortWorth: e.target.checked })}
            className="mt-1 w-4 h-4 text-olivewood focus:ring-olivewood border-clay-rose/40 rounded"
          />
          <div>
            <span className="block text-sm font-medium text-charcoal font-sans">
              Pre-load Fort Worth Bible Plan
            </span>
            <span className="block text-xs text-charcoal/60 font-sans mt-1">
              Automatically add the Fort Worth Bible Church 2025 plan with all 244 pre-generated lessons to this user's account
            </span>
          </div>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm font-sans">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm font-sans">
          {success}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-olivewood hover:bg-olivewood/90 disabled:bg-olivewood/50 text-white font-medium rounded-md transition-all shadow-sm hover:shadow font-sans"
      >
        {loading ? 'Creating User...' : 'Create User'}
      </button>
    </form>
  )
}
