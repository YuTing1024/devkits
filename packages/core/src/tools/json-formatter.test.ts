import { describe, it, expect } from 'vitest'
import { formatJson, validateJson } from './json-formatter.js'

describe('formatJson', () => {
  it('formats valid JSON with default indent (2 spaces)', () => {
    const result = formatJson('{"b":1,"a":2}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('{\n  "b": 1,\n  "a": 2\n}')
    }
  })

  it('formats with custom indent number', () => {
    const result = formatJson('{"a":1}', { indent: 4 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('{\n    "a": 1\n}')
    }
  })

  it('formats with tab indent', () => {
    const result = formatJson('{"a":1}', { indent: 'tab' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('{\n\t"a": 1\n}')
    }
  })

  it('sorts keys when sortKeys is true', () => {
    const result = formatJson('{"z":3,"a":1,"m":2}', { sortKeys: true })
    expect(result.ok).toBe(true)
    if (result.ok) {
      const parsed = JSON.parse(result.data)
      expect(Object.keys(parsed)).toEqual(['a', 'm', 'z'])
    }
  })

  it('sorts keys deeply in nested objects', () => {
    const result = formatJson('{"z":{"b":2,"a":1},"a":0}', { sortKeys: true })
    expect(result.ok).toBe(true)
    if (result.ok) {
      const parsed = JSON.parse(result.data)
      expect(Object.keys(parsed)).toEqual(['a', 'z'])
      expect(Object.keys(parsed.z)).toEqual(['a', 'b'])
    }
  })

  it('handles arrays', () => {
    const result = formatJson('[1,2,3]')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('[\n  1,\n  2,\n  3\n]')
    }
  })

  it('handles UTF-8 characters', () => {
    const result = formatJson('{"emoji":"🎉","chinese":"你好"}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      const parsed = JSON.parse(result.data)
      expect(parsed.emoji).toBe('🎉')
      expect(parsed.chinese).toBe('你好')
    }
  })

  it('returns error for empty string', () => {
    const result = formatJson('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Input is empty')
    }
  })

  it('returns error for whitespace-only string', () => {
    const result = formatJson('   ')
    expect(result.ok).toBe(false)
  })

  it('returns error for invalid JSON', () => {
    const result = formatJson('{bad json}')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid JSON')
    }
  })

  it('returns error for input exceeding 1MB', () => {
    const large = 'x'.repeat(1024 * 1024 + 1)
    const result = formatJson(large)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('1MB')
    }
  })

  it('handles null, boolean, and number primitives', () => {
    expect(formatJson('null').ok).toBe(true)
    expect(formatJson('true').ok).toBe(true)
    expect(formatJson('42').ok).toBe(true)
  })
})

describe('validateJson', () => {
  it('returns valid for valid JSON object', () => {
    const result = validateJson('{"a":1}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.valid).toBe(true)
    }
  })

  it('returns valid for valid JSON array', () => {
    const result = validateJson('[1,2,3]')
    expect(result.ok).toBe(true)
  })

  it('returns valid for JSON primitives', () => {
    expect(validateJson('"hello"').ok).toBe(true)
    expect(validateJson('42').ok).toBe(true)
    expect(validateJson('null').ok).toBe(true)
  })

  it('returns error for empty string', () => {
    const result = validateJson('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Input is empty')
    }
  })

  it('returns error for invalid JSON', () => {
    const result = validateJson('{invalid}')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid JSON')
    }
  })

  it('returns error for truncated JSON', () => {
    const result = validateJson('{"a": 1')
    expect(result.ok).toBe(false)
  })

  it('returns error for input exceeding 1MB', () => {
    const large = 'x'.repeat(1024 * 1024 + 1)
    const result = validateJson(large)
    expect(result.ok).toBe(false)
  })
})
