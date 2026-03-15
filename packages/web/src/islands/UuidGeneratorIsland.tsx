import { useState, useCallback } from 'react'
import { generateUuid } from '@devkits/core'
import { copyToClipboard } from '../lib/clipboard'
import CopyButton from '../components/ui/CopyButton'

type UuidVersion = 'v4' | 'v7'

export default function UuidGeneratorIsland() {
  const [version, setVersion] = useState<UuidVersion>('v4')
  const [count, setCount] = useState(1)
  const [uuids, setUuids] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const generate = useCallback(() => {
    const result = generateUuid({ version, count })
    if (result.ok) {
      setUuids(result.data)
      setError(null)
    } else {
      setUuids([])
      setError(result.error)
    }
  }, [version, count])

  const handleCopyAll = useCallback(async () => {
    if (!uuids.length) return
    const success = await copyToClipboard(uuids.join('\n'))
    if (success) {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    }
  }, [uuids])

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Options</h2>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Version
            </label>
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {(['v4', 'v7'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setVersion(v)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    version === v
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  UUID {v}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {version === 'v4' ? 'Random-based UUID' : 'Time-ordered UUID (sortable)'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Count (1–100)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={e => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-24 px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
            />
          </div>

          <button
            onClick={generate}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            Generate
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Output */}
      {uuids.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Generated UUIDs ({uuids.length})
            </h2>
            <button
              onClick={handleCopyAll}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                copiedAll
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {copiedAll ? 'Copied all!' : `Copy all (${uuids.length})`}
            </button>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {uuids.map((uuid, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-2.5 gap-4 ${
                  i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                }`}
              >
                <code className="font-mono text-sm text-gray-900 dark:text-gray-100 flex-1 select-all">
                  {uuid}
                </code>
                <CopyButton text={uuid} className="shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {uuids.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg className="mx-auto mb-3 w-10 h-10 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <p>Click Generate to create UUIDs</p>
        </div>
      )}
    </div>
  )
}
