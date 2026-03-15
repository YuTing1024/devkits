import { useState, useCallback } from 'react'
import { formatJson } from '@devkits/core'
import CodeEditor from '../components/tool/CodeEditor'
import DualPanel from '../components/tool/DualPanel'
import ActionBar from '../components/tool/ActionBar'
import { copyToClipboard } from '../lib/clipboard'
import { useKeyboardShortcut } from '../lib/keyboard'

const SAMPLE_JSON = `{
  "name": "DevKits",
  "version": "1.0.0",
  "tools": ["json-formatter", "base64", "url-encoder"]
}`

export default function JsonFormatterIsland() {
  const [input, setInput] = useState(SAMPLE_JSON)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [indent, setIndent] = useState<2 | 4 | 'tab'>(2)
  const [sortKeys, setSortKeys] = useState(false)
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
      const result = formatJson(input, { indent, sortKeys })
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
  }, [input, indent, sortKeys])

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
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Indent:</label>
          <div className="flex gap-1">
            {([2, 4, 'tab'] as const).map(v => (
              <button
                key={v}
                onClick={() => setIndent(v)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  indent === v
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {v === 'tab' ? 'Tab' : `${v} spaces`}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={e => setSortKeys(e.target.checked)}
            className="rounded"
          />
          Sort keys
        </label>
      </div>

      <ActionBar onExecute={execute} onCopy={handleCopy} onClear={handleClear} executing={executing} />

      <DualPanel
        left={
          <div className="h-full flex flex-col">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              Input
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
              <span>Output</span>
              {copied && <span className="text-green-600 dark:text-green-400 text-xs">Copied!</span>}
            </div>
            <CodeEditor
              value={output}
              language="json"
              readOnly
              placeholder="Formatted JSON will appear here..."
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
