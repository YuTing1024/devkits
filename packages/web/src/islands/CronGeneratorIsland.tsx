import { useState, useCallback } from 'react'
import { parseCron } from '@devkits/core'
import CopyButton from '../components/ui/CopyButton'

const PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every day at noon', value: '0 12 * * *' },
  { label: 'Weekdays at 9am', value: '0 9 * * 1-5' },
  { label: 'Every Sunday at 2am', value: '0 2 * * 0' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: '1st of month at midnight', value: '0 0 1 * *' },
]

export default function CronGeneratorIsland() {
  const [expression, setExpression] = useState('*/5 * * * *')
  const [result, setResult] = useState<{ description: string; nextRuns: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parse = useCallback((expr: string) => {
    if (!expr.trim()) {
      setResult(null)
      setError(null)
      return
    }
    const res = parseCron(expr)
    if (res.ok) {
      setResult(res.data)
      setError(null)
    } else {
      setResult(null)
      setError(res.error)
    }
  }, [])

  const handleChange = useCallback((val: string) => {
    setExpression(val)
    parse(val)
  }, [parse])

  const handlePreset = useCallback((val: string) => {
    setExpression(val)
    parse(val)
  }, [parse])

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
          Cron Expression
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={expression}
            onChange={e => handleChange(e.target.value)}
            placeholder="e.g. */5 * * * *"
            className="flex-1 px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            onClick={() => parse(expression)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Parse
          </button>
        </div>
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          Format: <code className="font-mono">minute hour day-of-month month day-of-week</code>
        </p>
      </div>

      {/* Presets */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Common Presets</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(preset => (
            <button
              key={preset.value}
              onClick={() => handlePreset(preset.value)}
              className={`inline-flex flex-col items-start px-3 py-2 text-xs rounded-lg border transition-colors ${
                expression === preset.value
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="font-medium">{preset.label}</span>
              <code className="font-mono text-gray-500 dark:text-gray-400">{preset.value}</code>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Description */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-1">Description</h2>
                <p className="text-sm text-gray-900 dark:text-gray-100">{result.description}</p>
              </div>
              <CopyButton text={result.description} className="shrink-0" />
            </div>
          </div>

          {/* Next Runs */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Next Scheduled Runs</h2>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {result.nextRuns.map((run, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-2.5 gap-4 ${
                    i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-4">{i + 1}</span>
                    <code className="font-mono text-sm text-gray-900 dark:text-gray-100">{run}</code>
                  </div>
                  <CopyButton text={run} className="shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!result && !error && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <svg className="mx-auto mb-3 w-10 h-10 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <p>Enter a cron expression or select a preset</p>
        </div>
      )}
    </div>
  )
}
