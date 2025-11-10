'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GuidedPlanForm } from './guided-plan-form'
import { ImportPlanForm } from './import-plan-form'
import { Sparkles } from 'lucide-react'

interface PlanCreatorProps {
  userId: string
}

type PlanMode = 'select' | 'guided' | 'import'

export function PlanCreator({ userId }: PlanCreatorProps) {
  const [mode, setMode] = useState<PlanMode>('select')
  const router = useRouter()

  if (mode === 'guided') {
    return <GuidedPlanForm userId={userId} onBack={() => setMode('select')} />
  }

  if (mode === 'import') {
    return <ImportPlanForm userId={userId} onBack={() => setMode('select')} />
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <button
        onClick={() => setMode('guided')}
        className="group p-8 bg-white/90 hover:bg-white backdrop-blur-lg rounded-lg border border-olivewood/20 transition-all shadow-lg hover:shadow-xl hover:border-olivewood/30"
      >
        <div className="text-4xl mb-6">📖</div>
        <h3 className="text-2xl font-bold text-charcoal mb-3 font-heading">Guided Plan</h3>
        <p className="text-charcoal/70 text-sm font-sans leading-relaxed">
          Choose from pre-made plans like "Read the Gospels in 30 Days" or theme-based studies
        </p>
      </button>

      <button
        onClick={() => router.push('/plans/wizard')}
        className="group relative p-8 bg-gradient-to-br from-golden-wheat/10 via-white/90 to-olivewood/10 hover:from-golden-wheat/20 hover:via-white hover:to-olivewood/20 backdrop-blur-lg rounded-lg border-2 border-golden-wheat/40 hover:border-golden-wheat/60 transition-all shadow-lg hover:shadow-xl overflow-hidden"
      >
        {/* Sparkle decoration */}
        <div className="absolute top-3 right-3">
          <Sparkles className="w-5 h-5 text-golden-wheat" />
        </div>
        <div className="text-4xl mb-6">🤖</div>
        <h3 className="text-2xl font-bold text-charcoal mb-3 font-heading flex items-center gap-2">
          AI-Powered Builder
          <span className="px-2 py-0.5 bg-golden-wheat text-white text-xs rounded-full font-sans">New</span>
        </h3>
        <p className="text-charcoal/70 text-sm font-sans leading-relaxed">
          Let AI create a personalized study plan based on what you want to learn
        </p>
      </button>

      <button
        onClick={() => setMode('import')}
        className="group p-8 bg-white/90 hover:bg-white backdrop-blur-lg rounded-lg border border-olivewood/20 transition-all shadow-lg hover:shadow-xl hover:border-olivewood/30"
      >
        <div className="text-4xl mb-6">📋</div>
        <h3 className="text-2xl font-bold text-charcoal mb-3 font-heading">Import Plan</h3>
        <p className="text-charcoal/70 text-sm font-sans leading-relaxed">
          Paste a list of Bible references to create a structured reading plan
        </p>
      </button>
    </div>
  )
}
