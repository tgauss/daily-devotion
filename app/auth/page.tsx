import { AuthForm } from '@/components/auth/auth-form'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Daily Devotion</h1>
          <p className="text-blue-200">Your personal Bible study companion</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
