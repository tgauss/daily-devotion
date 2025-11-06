import { AuthForm } from '@/components/auth/auth-form'

export default function AuthPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#f5f1e8] px-4"
      style={{
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, rgba(139, 116, 82, .03) 25%, rgba(139, 116, 82, .03) 26%, transparent 27%, transparent 74%, rgba(139, 116, 82, .03) 75%, rgba(139, 116, 82, .03) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(139, 116, 82, .03) 25%, rgba(139, 116, 82, .03) 26%, transparent 27%, transparent 74%, rgba(139, 116, 82, .03) 75%, rgba(139, 116, 82, .03) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '50px 50px'
      }}
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-950 mb-2 font-serif">Daily Devotion</h1>
          <p className="text-amber-700 font-serif">Your personal Bible study companion</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
