import { useState, useEffect, useCallback, useRef } from 'react'
import { timestampToDate, dateToTimestamp, getCurrentTimestamp } from '@devkits/core'
import { copyToClipboard } from '../lib/clipboard'
import CopyButton from '../components/ui/CopyButton'

export default function TimestampConverterIsland() {
  const [nowTs, setNowTs] = useState(() => getCurrentTimestamp())
  const [tsInput, setTsInput] = useState('')
  const [tsResult, setTsResult] = useState<{ iso: string; utc: string; local: string; relative: string } | null>(null)
  const [tsError, setTsError] = useState<string | null>(null)
  const [dateInput, setDateInput] = useState('')
  const [dateResult, setDateResult] = useState<{ seconds: number; milliseconds: number } | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setNowTs(getCurrentTimestamp())
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const convertTimestamp = useCallback(() => {
    if (!tsInput.trim()) {
      setTsResult(null)
      setTsError(null)
      return
    }
    const result = timestampToDate(tsInput)
    if (result.ok) {
      setTsResult(result.data)
      setTsError(null)
    } else {
      setTsResult(null)
      setTsError(result.error)
    }
  }, [tsInput])

  const convertDate = useCallback(() => {
    if (!dateInput.trim()) {
      setDateResult(null)
      setDateError(null)
      return
    }
    const result = dateToTimestamp(dateInput)
    if (result.ok) {
      setDateResult(result.data)
      setDateError(null)
    } else {
      setDateResult(null)
      setDateError(result.error)
    }
  }, [dateInput])

  const useNowAsTimestamp = useCallback(() => {
    setTsInput(String(nowTs.seconds))
    const result = timestampToDate(nowTs.seconds)
    if (result.ok) {
      setTsResult(result.data)
      setTsError(null)
    }
  }, [nowTs])

  return (
    <div className="space-y-6">
      {/* Live Now */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">Current Time</h2>
            <div className="flex flex-wrap gap-4 font-mono text-sm text-gray-900 dark:text-gray-100">
              <span><span className="text-gray-500 dark:text-gray-400">Seconds: </span>{nowTs.seconds}</span>
              <span><span className="text-gray-500 dark:text-gray-400">Milliseconds: </span>{nowTs.milliseconds}</span>
            </div>
          </div>
          <button
            onClick={useNowAsTimestamp}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Use Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timestamp → Date */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Timestamp → Date</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={tsInput}
              onChange={e => setTsInput(e.target.value)}
              placeholder="e.g. 1700000000 or 1700000000000"
              className="flex-1 px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              onClick={convertTimestamp}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Convert
            </button>
          </div>
          {tsError && (
            <p className="text-sm text-red-600 dark:text-red-400">{tsError}</p>
          )}
          {tsResult && (
            <div className="space-y-2">
              {[
                { label: 'ISO 8601', value: tsResult.iso },
                { label: 'UTC', value: tsResult.utc },
                { label: 'Local', value: tsResult.local },
                { label: 'Relative', value: tsResult.relative },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">{label}</span>
                    <span className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{value}</span>
                  </div>
                  <CopyButton text={value} className="shrink-0" />
                </div>
              ))}
            </div>
          )}
          {!tsResult && !tsError && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter a Unix timestamp (seconds or milliseconds)</p>
          )}
        </div>

        {/* Date → Timestamp */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date → Timestamp</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={dateInput}
              onChange={e => setDateInput(e.target.value)}
              placeholder="e.g. 2024-01-15 or 2024-01-15T12:00:00Z"
              className="flex-1 px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              onClick={convertDate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Convert
            </button>
          </div>
          {dateError && (
            <p className="text-sm text-red-600 dark:text-red-400">{dateError}</p>
          )}
          {dateResult && (
            <div className="space-y-2">
              {[
                { label: 'Seconds', value: String(dateResult.seconds) },
                { label: 'Milliseconds', value: String(dateResult.milliseconds) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">{label}</span>
                    <span className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{value}</span>
                  </div>
                  <CopyButton text={value} className="shrink-0" />
                </div>
              ))}
            </div>
          )}
          {!dateResult && !dateError && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter a date string in any standard format</p>
          )}
        </div>
      </div>
    </div>
  )
}
