import { describe, it, expect } from 'vitest'
import { encodeBase64, decodeBase64 } from './base64.js'

describe('encodeBase64', () => {
  it('encodes a simple ASCII string', () => {
    const result = encodeBase64('hello')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('aGVsbG8=')
    }
  })

  it('encodes UTF-8 string with emoji', () => {
    const result = encodeBase64('Hello 🎉')
    expect(result.ok).toBe(true)
    if (result.ok) {
      // Verify round-trip
      const decoded = decodeBase64(result.data)
      expect(decoded.ok).toBe(true)
      if (decoded.ok) {
        expect(decoded.data).toBe('Hello 🎉')
      }
    }
  })

  it('encodes UTF-8 string with Chinese characters', () => {
    const result = encodeBase64('你好世界')
    expect(result.ok).toBe(true)
    if (result.ok) {
      const decoded = decodeBase64(result.data)
      expect(decoded.ok).toBe(true)
      if (decoded.ok) {
        expect(decoded.data).toBe('你好世界')
      }
    }
  })

  it('encodes special characters', () => {
    const result = encodeBase64('<script>alert("xss")</script>')
    expect(result.ok).toBe(true)
    if (result.ok) {
      const decoded = decodeBase64(result.data)
      expect(decoded.ok).toBe(true)
      if (decoded.ok) {
        expect(decoded.data).toBe('<script>alert("xss")</script>')
      }
    }
  })

  it('returns error for empty string', () => {
    const result = encodeBase64('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Input is empty')
    }
  })

  it('encodes a long string', () => {
    const long = 'a'.repeat(10000)
    const result = encodeBase64(long)
    expect(result.ok).toBe(true)
  })
})

describe('decodeBase64', () => {
  it('decodes a valid base64 string', () => {
    const result = decodeBase64('aGVsbG8=')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('hello')
    }
  })

  it('decodes base64 with UTF-8 content', () => {
    // "你好" encoded as UTF-8 then base64
    const encoded = encodeBase64('你好')
    expect(encoded.ok).toBe(true)
    if (encoded.ok) {
      const result = decodeBase64(encoded.data)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data).toBe('你好')
      }
    }
  })

  it('returns error for empty string', () => {
    const result = decodeBase64('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Input is empty')
    }
  })

  it('returns error for invalid base64 characters', () => {
    const result = decodeBase64('not!valid@base64#')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid base64')
    }
  })

  it('handles base64 with whitespace (strips it)', () => {
    // "hello" = aGVsbG8=
    const result = decodeBase64('aGVs\nbG8=')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('hello')
    }
  })

  it('decodes base64 without padding', () => {
    // Some base64 omits trailing '='
    const result = decodeBase64('aGVsbG8')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('hello')
    }
  })
})
