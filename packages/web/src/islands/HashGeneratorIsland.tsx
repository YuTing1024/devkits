import { useState, useCallback, useEffect, useRef } from 'react'
import { generateHash } from '@devkits/core'
import CopyButton from '../components/ui/CopyButton'

type Algorithm = 'md5' | 'sha1' | 'sha256' | 'sha512'

const ALGORITHMS: { key: Algorithm; label: string }[] = [
  { key: 'md5', label: 'MD5' },
  { key: 'sha1', label: 'SHA-1' },
  { key: 'sha256', label: 'SHA-256' },
  { key: 'sha512', label: 'SHA-512' },
]

interface HashResult {
  algorithm: Algorithm
  label: string
  value: string | null
  error: string | null
  loading: boolean
}

export default function HashGeneratorIsland() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<HashResult[]>(
    ALGORITHMS.map(a => ({ algorithm: a.key, label: a.label, value: null, error: null, loading: false }))
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const computeHashes = useCallback(async (text: string) => {
    if (!text) {
      setHashes(ALGORITHMS.map(a => ({ algorithm: a.key, label: a.label, value: null, error: null, loading: false })))
      return
    }

    // Set all to loading
    setHashes(ALGORITHMS.map(a => ({ algorithm: a.key, label: a.label, value: null, error: null, loading: true })))

    // Compute all hashes concurrently
    const results = await Promise.all(
      ALGORITHMS.map(async ({ key, label }) => {
        const result = await generateHash(text, key)
        return {
          algorithm: key,
          label,
          value: result.ok ? result.data : null,
          error: result.ok ? null : result.error,
          loading: false,
        }
      })
    )
    setHashes(results)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      computeHashes(input)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [input, computeHashes])

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
          Input text
        </label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type or paste text to hash..."
          rows={6}
          className="w-full px-3 py-2 font-mono text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Hashes are computed automatically as you type (300ms debounce)
        </p>
      </div>

      {/* Hash results */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                Algorithm
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Hash
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                Copy
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {hashes.map(({ algorithm, label, value, error, loading }) => (
              <tr key={algorithm} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {label}
                </td>
                <td className="px-4 py-3 font-mono text-xs break-all">
                  {loading ? (
                    <span className="text-gray-400 dark:text-gray-500 animate-pulse">Computing...</span>
                  ) : error ? (
                    <span className="text-red-500 dark:text-red-400">{error}</span>
                  ) : value ? (
                    <span className="text-gray-900 dark:text-gray-100 select-all">{value}</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {value && <CopyButton text={value} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
