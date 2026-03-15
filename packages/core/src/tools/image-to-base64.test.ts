import { describe, it, expect } from 'vitest'
import { imageFileToBase64 } from './image-to-base64.js'

// Minimal 1x1 PNG (valid PNG bytes)
const TINY_PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, // IDAT chunk
  0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc,
  0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, // IEND chunk
  0x44, 0xae, 0x42, 0x60, 0x82,
])

describe('imageFileToBase64', () => {
  it('converts a PNG image to base64', () => {
    const result = imageFileToBase64({ data: TINY_PNG, type: 'image/png', name: 'test.png' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.base64).toBeTruthy()
      expect(result.data.base64.length).toBeGreaterThan(0)
    }
  })

  it('generates a valid data URI', () => {
    const result = imageFileToBase64({ data: TINY_PNG, type: 'image/png', name: 'test.png' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.dataUri).toMatch(/^data:image\/png;base64,/)
    }
  })

  it('generates a CSS background-image snippet', () => {
    const result = imageFileToBase64({ data: TINY_PNG, type: 'image/png', name: 'test.png' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.cssBackground).toMatch(/^background-image: url\(/)
    }
  })

  it('generates an img tag snippet', () => {
    const result = imageFileToBase64({ data: TINY_PNG, type: 'image/png', name: 'test.png' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.imgTag).toMatch(/^<img src="data:image\/png;base64,/)
      expect(result.data.imgTag).toContain('alt="test.png"')
    }
  })

  it('returns error for non-image MIME type', () => {
    const result = imageFileToBase64({ data: TINY_PNG, type: 'application/pdf', name: 'doc.pdf' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('image/')
    }
  })

  it('returns error for empty MIME type', () => {
    const result = imageFileToBase64({ data: TINY_PNG, type: '', name: 'unknown' })
    expect(result.ok).toBe(false)
  })

  it('returns error for empty data', () => {
    const result = imageFileToBase64({ data: new Uint8Array(0), type: 'image/png', name: 'empty.png' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('empty')
    }
  })

  it('returns error when file size exceeds 5MB', () => {
    const bigData = new Uint8Array(5 * 1024 * 1024 + 1)
    const result = imageFileToBase64({ data: bigData, type: 'image/png', name: 'big.png' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('5MB')
    }
  })

  it('accepts jpeg MIME type', () => {
    const result = imageFileToBase64({ data: TINY_PNG, type: 'image/jpeg', name: 'photo.jpg' })
    expect(result.ok).toBe(true)
  })

  it('escapes HTML in file name for img tag', () => {
    const result = imageFileToBase64({ data: TINY_PNG, type: 'image/png', name: '<script>xss</script>.png' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.imgTag).not.toContain('<script>')
      expect(result.data.imgTag).toContain('&lt;script&gt;')
    }
  })

  it('base64 output can be decoded back to original bytes', () => {
    const result = imageFileToBase64({ data: TINY_PNG, type: 'image/png', name: 'test.png' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      const decoded = atob(result.data.base64)
      const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0))
      expect(bytes).toEqual(TINY_PNG)
    }
  })
})
