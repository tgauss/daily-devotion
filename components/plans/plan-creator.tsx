'use client'

import { useState } from 'react'
import { GuidedPlanForm } from './guided-plan-form'
import { CustomPlanForm } from './custom-plan-form'
import { ImportPlanForm } from './import-plan-form'

interface PlanCreatorProps {
  userId: string
}

type PlanMode = 'select' | 'guided' | 'custom' | 'import'

export function PlanCreator({ userId }: PlanCreatorProps) {
  const [mode, setMode] = useState<PlanMode>('select')

  if (mode === 'guided') {
    return <GuidedPlanForm userId={userId} onBack={() => setMode('select')} />
  }

  if (mode === 'custom') {
    return <CustomPlanForm userId={userId} onBack={() => setMode('select')} />
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
        onClick={() => setMode('custom')}
        className="group p-8 bg-white/90 hover:bg-white backdrop-blur-lg rounded-lg border border-olivewood/20 transition-all shadow-lg hover:shadow-xl hover:border-olivewood/30"
      >
        <div className="text-4xl mb-6">✏️</div>
        <h3 className="text-2xl font-bold text-charcoal mb-3 font-heading">Custom Plan</h3>
        <p className="text-charcoal/70 text-sm font-sans leading-relaxed">
          Build your own plan by selecting specific books, chapters, or passages
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
