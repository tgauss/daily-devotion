import { SignupForm } from '@/components/auth/signup-form'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

export default function SignupPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-sandstone px-4 py-12"
      style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent),
          linear-gradient(0deg, transparent 24%, rgba(165, 154, 126, .02) 25%, rgba(165, 154, 126, .02) 26%, transparent 27%, transparent 74%, rgba(165, 154, 126, .02) 75%, rgba(165, 154, 126, .02) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '60px 60px'
      }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/my-daily-break-logo.png"
              alt="My Daily Bread Logo"
              width={80}
              height={80}
              className="w-20 h-20 mx-auto"
            />
          </Link>
          <h1 className="text-5xl font-heading text-charcoal mb-3 tracking-tight">
            Begin Your Journey
          </h1>
          <p className="text-lg text-olivewood font-serif italic mb-2">
            Daily nourishment for the soul
          </p>
          <p className="text-sm text-charcoal/70 font-sans">
            Create your free account to start your spiritual growth journey
          </p>
        </div>

        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <SignupForm />
        </Suspense>

        {/* Already have account link */}
        <div className="text-center pt-4 border-t border-olivewood/20">
          <p className="text-charcoal/70 font-sans text-sm mb-2">
            Already have an account?
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 text-olivewood hover:text-olivewood/80 font-sans font-medium transition-colors"
          >
            Sign in here →
          </Link>
        </div>
      </div>
    </div>
  )
}
