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
    <div className="grid gap-6 md:grid-cols-3">
      <button
        onClick={() => setMode('guided')}
        className="group p-8 bg-white/10 hover:bg-white/15 backdrop-blur-lg rounded-2xl border border-white/20 transition-all shadow-xl"
      >
        <div className="text-4xl mb-4">📖</div>
        <h3 className="text-2xl font-bold text-white mb-2">Guided Plan</h3>
        <p className="text-white/70 text-sm">
          Choose from pre-made plans like "Read the Gospels in 30 Days" or theme-based studies
        </p>
      </button>

      <button
        onClick={() => setMode('custom')}
        className="group p-8 bg-white/10 hover:bg-white/15 backdrop-blur-lg rounded-2xl border border-white/20 transition-all shadow-xl"
      >
        <div className="text-4xl mb-4">✏️</div>
        <h3 className="text-2xl font-bold text-white mb-2">Custom Plan</h3>
        <p className="text-white/70 text-sm">
          Build your own plan by selecting specific books, chapters, or passages
        </p>
      </button>

      <button
        onClick={() => setMode('import')}
        className="group p-8 bg-white/10 hover:bg-white/15 backdrop-blur-lg rounded-2xl border border-white/20 transition-all shadow-xl"
      >
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-2xl font-bold text-white mb-2">Import Plan</h3>
        <p className="text-white/70 text-sm">
          Paste a list of Bible references to create a structured reading plan
        </p>
      </button>
    </div>
  )
}
