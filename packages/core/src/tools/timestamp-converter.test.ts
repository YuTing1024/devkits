import { describe, it, expect } from 'vitest'
import { timestampToDate, dateToTimestamp, getCurrentTimestamp } from './timestamp-converter.js'

describe('timestampToDate', () => {
  it('converts a Unix timestamp in seconds to date parts', () => {
    const result = timestampToDate(0)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.iso).toBe('1970-01-01T00:00:00.000Z')
    }
  })

  it('auto-detects milliseconds when input > 1e12', () => {
    const ms = 1700000000000
    const result = timestampToDate(ms)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.iso).toBe(new Date(ms).toISOString())
    }
  })

  it('treats input <= 1e12 as seconds', () => {
    const seconds = 1700000000
    const result = timestampToDate(seconds)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.iso).toBe(new Date(seconds * 1000).toISOString())
    }
  })

  it('accepts string input', () => {
    const result = timestampToDate('1700000000')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.iso).toBe(new Date(1700000000 * 1000).toISOString())
    }
  })

  it('returns all required fields', () => {
    const result = timestampToDate(1700000000)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveProperty('iso')
      expect(result.data).toHaveProperty('utc')
      expect(result.data).toHaveProperty('local')
      expect(result.data).toHaveProperty('relative')
    }
  })

  it('returns error for empty string', () => {
    const result = timestampToDate('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Input is empty')
    }
  })

  it('returns error for non-numeric string', () => {
    const result = timestampToDate('not-a-number')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('not a number')
    }
  })

  it('returns relative time containing "ago" for past timestamps', () => {
    const result = timestampToDate(1000000) // very old timestamp
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.relative).toContain('ago')
    }
  })
})

describe('dateToTimestamp', () => {
  it('converts ISO date string to timestamps', () => {
    const result = dateToTimestamp('1970-01-01T00:00:00.000Z')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.seconds).toBe(0)
      expect(result.data.milliseconds).toBe(0)
    }
  })

  it('returns both seconds and milliseconds', () => {
    const result = dateToTimestamp('2020-01-01T00:00:00.000Z')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.milliseconds).toBe(result.data.seconds * 1000)
    }
  })

  it('returns error for empty input', () => {
    const result = dateToTimestamp('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Input is empty')
    }
  })

  it('returns error for invalid date', () => {
    const result = dateToTimestamp('not-a-date')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid date')
    }
  })

  it('handles date-only strings', () => {
    const result = dateToTimestamp('2020-06-15')
    expect(result.ok).toBe(true)
  })
})

describe('getCurrentTimestamp', () => {
  it('returns current seconds and milliseconds', () => {
    const before = Date.now()
    const ts = getCurrentTimestamp()
    const after = Date.now()
    expect(ts.milliseconds).toBeGreaterThanOrEqual(before)
    expect(ts.milliseconds).toBeLessThanOrEqual(after)
    expect(ts.seconds).toBe(Math.floor(ts.milliseconds / 1000))
  })
})
