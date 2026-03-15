import { describe, it, expect } from 'vitest'
import { parseCron, describeCron } from './cron-generator.js'

describe('parseCron', () => {
  it('parses a valid cron expression', () => {
    const result = parseCron('*/5 * * * *')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.description).toBeTruthy()
      expect(result.data.nextRuns).toHaveLength(5)
    }
  })

  it('returns 5 next run ISO strings', () => {
    const result = parseCron('0 0 * * *')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.nextRuns).toHaveLength(5)
      for (const run of result.data.nextRuns) {
        expect(() => new Date(run)).not.toThrow()
        expect(new Date(run).toISOString()).toBe(run)
      }
    }
  })

  it('returns error for empty input', () => {
    const result = parseCron('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Expression is empty')
    }
  })

  it('returns error for invalid expression', () => {
    const result = parseCron('not-a-cron')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid cron expression')
    }
  })

  it('returns error for expression with wrong number of fields', () => {
    const result = parseCron('* *')
    expect(result.ok).toBe(false)
  })

  it('handles whitespace-padded expression', () => {
    const result = parseCron('  0 12 * * *  ')
    expect(result.ok).toBe(true)
  })

  it('next runs are in ascending order', () => {
    const result = parseCron('0 9 * * 1')
    expect(result.ok).toBe(true)
    if (result.ok) {
      const times = result.data.nextRuns.map(d => new Date(d).getTime())
      for (let i = 1; i < times.length; i++) {
        expect(times[i]).toBeGreaterThan(times[i - 1])
      }
    }
  })
})

describe('describeCron', () => {
  it('describes every minute', () => {
    expect(describeCron('* * * * *')).toBe('Every minute')
  })

  it('describes every hour', () => {
    expect(describeCron('0 * * * *')).toBe('At the start of every hour')
  })

  it('describes every day at midnight', () => {
    expect(describeCron('0 0 * * *')).toBe('Every day at midnight')
  })

  it('describes every N minutes', () => {
    const desc = describeCron('*/15 * * * *')
    expect(desc).toContain('15')
  })

  it('returns a non-empty string for arbitrary cron', () => {
    const desc = describeCron('30 14 * * 5')
    expect(typeof desc).toBe('string')
    expect(desc.length).toBeGreaterThan(0)
  })
})
