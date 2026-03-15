import { useState, useCallback } from 'react'
import { yamlToJson, jsonToYaml } from '@devkits/core'
import CodeEditor from '../components/tool/CodeEditor'
import DualPanel from '../components/tool/DualPanel'
import ActionBar from '../components/tool/ActionBar'
import { copyToClipboard } from '../lib/clipboard'
import { useKeyboardShortcut } from '../lib/keyboard'

type Direction = 'yaml-to-json' | 'json-to-yaml'

const SAMPLE_YAML = `name: DevKits
version: "1.0.0"
tools:
  - name: json-formatter
    category: formatters
  - name: base64
    category: encoders
settings:
  darkMode: true
  maxItems: 100`

const SAMPLE_JSON = `{
  "name": "DevKits",
  "version": "1.0.0",
  "tools": [
    { "name": "json-formatter", "category": "formatters" },
    { "name": "base64", "category": "encoders" }
  ],
  "settings": {
    "darkMode": true,
    "maxItems": 100
  }
}`

export default function YamlJsonIsland() {
  const [direction, setDirection] = useState<Direction>('yaml-to-json')
  const [input, setInput] = useState(SAMPLE_YAML)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
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
      const result = direction === 'yaml-to-json'
        ? yamlToJson(input)
        : jsonToYaml(input)
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
  }, [input, direction])

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

  const handleDirectionChange = useCallback((dir: Direction) => {
    setDirection(dir)
    setInput(dir === 'yaml-to-json' ? SAMPLE_YAML : SAMPLE_JSON)
    setOutput('')
    setError(null)
  }, [])

  useKeyboardShortcut('Enter', (e) => {
    e.preventDefault()
    execute()
  }, { ctrlKey: true })

  const inputLang = direction === 'yaml-to-json' ? 'yaml' : 'json'
  const outputLang = direction === 'yaml-to-json' ? 'json' : 'yaml'

  return (
    <div className="space-y-4">
      {/* Direction toggle */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Direction:</label>
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {([
            { key: 'yaml-to-json' as Direction, label: 'YAML → JSON' },
            { key: 'json-to-yaml' as Direction, label: 'JSON → YAML' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleDirectionChange(key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                direction === key
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ActionBar onExecute={execute} onCopy={handleCopy} onClear={handleClear} executing={executing} />

      <DualPanel
        left={
          <div className="h-full flex flex-col">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 uppercase tracking-wider">
              {inputLang} Input
            </div>
            <CodeEditor
              value={input}
              onChange={setInput}
              language={inputLang}
              placeholder={`Paste ${inputLang.toUpperCase()} here...`}
              minHeight="300px"
            />
          </div>
        }
        right={
          <div className="h-full flex flex-col">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <span className="uppercase tracking-wider">{outputLang} Output</span>
              {copied && <span className="text-green-600 dark:text-green-400 text-xs">Copied!</span>}
            </div>
            <CodeEditor
              value={output}
              language={outputLang}
              readOnly
              placeholder={`Converted ${outputLang.toUpperCase()} will appear here...`}
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
