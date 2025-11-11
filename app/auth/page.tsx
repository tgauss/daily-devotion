import { AuthForm } from '@/components/auth/auth-form'
import Image from 'next/image'
import { Suspense } from 'react'

export default function AuthPage() {
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
          <div className="flex justify-center mb-6">
            <Image
              src="/my-daily-break-logo.png"
              alt="My Daily Bread Logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-5xl font-heading text-charcoal mb-3 tracking-tight">
            My Daily Bread
          </h1>
          <p className="text-lg text-olivewood font-serif italic">
            Daily nourishment for the soul
          </p>
          <p className="text-sm text-charcoal/70 font-sans mt-4">
            Feed your faith one day at a time.
          </p>
        </div>
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  )
}
