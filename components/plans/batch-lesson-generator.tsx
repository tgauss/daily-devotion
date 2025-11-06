'use client'

import { useState, useEffect } from 'react'

interface BatchLessonGeneratorProps {
  planId: string
  onComplete: () => void
}

export function BatchLessonGenerator({ planId, onComplete }: BatchLessonGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState({ completed: 0, total: 0, remaining: 0 })
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const generateBatch = async () => {
    try {
      const response = await fetch('/api/lessons/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          batchSize: 5, // Process 5 lessons at a time (should complete in ~2-3 minutes per batch)
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate batch: ${response.statusText}`)
      }

      const data = await response.json()

      setProgress(data.progress)

      // Log results
      const successCount = data.results.filter((r: any) => r.status === 'success').length
      const errorCount = data.results.filter((r: any) => r.status === 'error').length

      addLog(`Batch complete: ${successCount} succeeded, ${errorCount} failed. Progress: ${data.progress.completed}/${data.progress.total}`)

      return data.completed
    } catch (err: any) {
      addLog(`Error: ${err.message}`)
      throw err
    }
  }

  const startGeneration = async () => {
    if (!confirm('Generate all lessons for this plan? This will run in the background and may take 20-40 minutes.')) {
      return
    }

    setIsGenerating(true)
    setError(null)
    setLogs([])
    addLog('Starting lesson generation...')

    try {
      let completed = false
      let batchCount = 0

      while (!completed) {
        batchCount++
        addLog(`Processing batch #${batchCount}...`)

        completed = await generateBatch()

        if (!completed) {
          // Small delay between batches to avoid overwhelming the API
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      addLog('✅ All lessons generated successfully!')
      onComplete()
    } catch (err: any) {
      setError(err.message)
      addLog(`❌ Generation stopped due to error: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const stopGeneration = () => {
    setIsGenerating(false)
    addLog('Generation stopped by user')
  }

  return (
    <div className="space-y-6">
      {/* Control buttons */}
      <div className="flex gap-4">
        <button
          onClick={startGeneration}
          disabled={isGenerating}
          className="flex-1 px-8 py-4 bg-olivewood hover:bg-olivewood/90 disabled:bg-olivewood/50 text-white font-semibold rounded-md border border-olivewood/50 transition-colors font-sans"
        >
          {isGenerating ? 'Generating...' : 'Generate All Lessons'}
        </button>

        {isGenerating && (
          <button
            onClick={stopGeneration}
            className="px-8 py-4 bg-clay-rose hover:bg-clay-rose/90 text-white font-semibold rounded-md border border-clay-rose/50 transition-colors font-sans"
          >
            Stop
          </button>
        )}
      </div>

      {/* Progress bar */}
      {progress.total > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-charcoal/70 font-sans">
            <span>Progress: {progress.completed} / {progress.total}</span>
            <span>{Math.round((progress.completed / progress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-sandstone rounded-lg h-4 border border-olivewood/20 overflow-hidden">
            <div
              className="h-full bg-olivewood transition-all duration-300 border-r border-olivewood/50"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg shadow-lg">
          <p className="text-red-800 font-sans text-sm">
            <strong>Error:</strong> {error}
          </p>
          <p className="text-red-700 font-sans text-xs mt-2">
            You can click "Generate All Lessons" again to retry from where it left off.
          </p>
        </div>
      )}

      {/* Activity log */}
      {logs.length > 0 && (
        <div className="bg-sandstone border border-olivewood/20 rounded-lg p-6 max-h-64 overflow-y-auto shadow-lg">
          <h3 className="text-sm font-semibold text-charcoal mb-3 font-sans">Activity Log</h3>
          <div className="space-y-1">
            {logs.map((log, idx) => (
              <p key={idx} className="text-xs text-charcoal/70 font-mono">
                {log}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
