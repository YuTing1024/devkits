import { describe, it, expect } from 'vitest'
import { encodeUrl, decodeUrl } from './url-encoder.js'

describe('encodeUrl', () => {
  it('encodes special characters with component mode (default)', () => {
    const result = encodeUrl('hello world & more=stuff')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('hello%20world%20%26%20more%3Dstuff')
    }
  })

  it('encodes with explicit component mode', () => {
    const result = encodeUrl('a=1&b=2', 'component')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('a%3D1%26b%3D2')
    }
  })

  it('encodes with full mode (preserves :// and /)', () => {
    const result = encodeUrl('https://example.com/path?a=1&b=hello world', 'full')
    expect(result.ok).toBe(true)
    if (result.ok) {
      // full mode preserves : / ? & = but encodes spaces
      expect(result.data).toContain('https://example.com/path')
      expect(result.data).toContain('hello%20world')
    }
  })

  it('encodes UTF-8 characters', () => {
    const result = encodeUrl('你好')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('%E4%BD%A0%E5%A5%BD')
    }
  })

  it('encodes emoji', () => {
    const result = encodeUrl('hello 🎉')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('%F0%9F%8E%89')
    }
  })

  it('returns error for empty string', () => {
    const result = encodeUrl('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Input is empty')
    }
  })

  it('handles already-encoded string gracefully', () => {
    const result = encodeUrl('hello%20world')
    expect(result.ok).toBe(true)
    if (result.ok) {
      // % gets double-encoded in component mode
      expect(result.data).toContain('hello%2520world')
    }
  })
})

describe('decodeUrl', () => {
  it('decodes a percent-encoded string (component mode, default)', () => {
    const result = decodeUrl('hello%20world%20%26%20more%3Dstuff')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('hello world & more=stuff')
    }
  })

  it('decodes UTF-8 encoded string', () => {
    const result = decodeUrl('%E4%BD%A0%E5%A5%BD')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('你好')
    }
  })

  it('decodes with full mode', () => {
    const result = decodeUrl('https://example.com/path?a=hello%20world', 'full')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toBe('https://example.com/path?a=hello world')
    }
  })

  it('returns error for empty string', () => {
    const result = decodeUrl('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Input is empty')
    }
  })

  it('returns error for malformed percent encoding', () => {
    const result = decodeUrl('hello%GGworld')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Decoding failed')
    }
  })

  it('handles round-trip encode/decode', () => {
    const original = 'key=value&foo=bar baz'
    const encoded = encodeUrl(original)
    expect(encoded.ok).toBe(true)
    if (encoded.ok) {
      const decoded = decodeUrl(encoded.data)
      expect(decoded.ok).toBe(true)
      if (decoded.ok) {
        expect(decoded.data).toBe(original)
      }
    }
  })
})
