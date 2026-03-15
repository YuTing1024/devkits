import { useState, useCallback } from 'react'
import { encodeBase64, decodeBase64 } from '@devkits/core'
import ActionBar from '../components/tool/ActionBar'
import { copyToClipboard } from '../lib/clipboard'
import { useKeyboardShortcut } from '../lib/keyboard'

type Mode = 'encode' | 'decode'

export default function Base64Island() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [executing, setExecuting] = useState(false)

  const execute = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }
    setExecuting(true)
    try {
      const result = mode === 'encode' ? encodeBase64(input) : decodeBase64(input)
      if (result.ok) {
        setOutput(result.data)
        setError(null)
      } else {
        setOutput('')
        setError(result.error)
      }
    } finally {
      setExecuting(false)
    }
  }, [input, mode])

  const handleCopy = useCallback(async () => {
    if (!output) return
    await copyToClipboard(output)
  }, [output])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
  }, [])

  useKeyboardShortcut('Enter', (e) => {
    e.preventDefault()
    execute()
  }, { ctrlKey: true })

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {(['encode', 'decode'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setOutput(''); setError(null) }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              mode === m
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <ActionBar onExecute={execute} onCopy={handleCopy} onClear={handleClear} executing={executing} />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex flex-col">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            {mode === 'encode' ? 'Plain text' : 'Base64 encoded'}
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
            rows={10}
            className="w-full px-3 py-2 font-mono text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            {mode === 'encode' ? 'Base64 encoded' : 'Decoded text'}
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            rows={10}
            className="w-full px-3 py-2 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg resize-y focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
