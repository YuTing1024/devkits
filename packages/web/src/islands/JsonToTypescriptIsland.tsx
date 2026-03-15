import { useState, useCallback } from 'react'
import { jsonToTypescript } from '@devkits/core'
import CodeEditor from '../components/tool/CodeEditor'
import DualPanel from '../components/tool/DualPanel'
import ActionBar from '../components/tool/ActionBar'
import { copyToClipboard } from '../lib/clipboard'
import { useKeyboardShortcut } from '../lib/keyboard'

const SAMPLE_JSON = `{
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "roles": ["admin", "editor"],
    "settings": {
      "darkMode": true,
      "notifications": false
    }
  }
}`

export default function JsonToTypescriptIsland() {
  const [input, setInput] = useState(SAMPLE_JSON)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [rootName, setRootName] = useState('Root')
  const [useInterface, setUseInterface] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [copied, setCopied] = useState(false)

  const execute = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }
    setExecuting(true)
    try {
      const result = jsonToTypescript(input, { rootName, useInterface })
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
  }, [input, rootName, useInterface])

  const handleCopy = useCallback(async () => {
    if (!output) return
    const success = await copyToClipboard(output)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
      {/* Options bar */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Root name:</label>
          <input
            type="text"
            value={rootName}
            onChange={e => setRootName(e.target.value || 'Root')}
            className="w-32 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</label>
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {([true, false] as const).map(v => (
              <button
                key={String(v)}
                onClick={() => setUseInterface(v)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  useInterface === v
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {v ? 'interface' : 'type'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ActionBar onExecute={execute} onCopy={handleCopy} onClear={handleClear} executing={executing} />

      <DualPanel
        left={
          <div className="h-full flex flex-col">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              JSON Input
            </div>
            <CodeEditor
              value={input}
              onChange={setInput}
              language="json"
              placeholder="Paste JSON here..."
              minHeight="300px"
            />
          </div>
        }
        right={
          <div className="h-full flex flex-col">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <span>TypeScript Output</span>
              {copied && <span className="text-green-600 dark:text-green-400 text-xs">Copied!</span>}
            </div>
            <CodeEditor
              value={output}
              language="text"
              readOnly
              placeholder="Generated TypeScript will appear here..."
              minHeight="300px"
            />
            {error && (
              <div className="px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
          </div>
        }
      />
    </div>
  )
}
