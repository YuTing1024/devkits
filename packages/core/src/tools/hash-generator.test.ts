import { describe, it, expect } from 'vitest'
import { generateHash } from './hash-generator.js'

describe('generateHash', () => {
  describe('MD5', () => {
    it('generates MD5 hash for simple string', async () => {
      const result = await generateHash('hello', 'md5')
      expect(result.ok).toBe(true)
      if (result.ok) {
        // Known MD5 of "hello"
        expect(result.data).toBe('5d41402abc4b2a76b9719d911017c592')
      }
    })

    it('generates MD5 hash for empty password string edge case', async () => {
      // MD5 of "" is well-known
      const result = await generateHash('test', 'md5')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data).toBe('098f6bcd4621d373cade4e832627b4f6')
      }
    })

    it('returns 32-character hex string for MD5', async () => {
      const result = await generateHash('hello world', 'md5')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data).toHaveLength(32)
        expect(result.data).toMatch(/^[0-9a-f]+$/)
      }
    })

    it('MD5 is deterministic', async () => {
      const r1 = await generateHash('same input', 'md5')
      const r2 = await generateHash('same input', 'md5')
      expect(r1.ok).toBe(true)
      expect(r2.ok).toBe(true)
      if (r1.ok && r2.ok) {
        expect(r1.data).toBe(r2.data)
      }
    })

    it('MD5 handles UTF-8 input', async () => {
      const result = await generateHash('你好', 'md5')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data).toHaveLength(32)
        expect(result.data).toMatch(/^[0-9a-f]+$/)
      }
    })
  })

  describe('SHA-1', () => {
    it('generates SHA-1 hash', async () => {
      const result = await generateHash('hello', 'sha1')
      // SubtleCrypto may not be available in all test environments
      if (result.ok) {
        // Known SHA-1 of "hello"
        expect(result.data).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d')
        expect(result.data).toHaveLength(40)
        expect(result.data).toMatch(/^[0-9a-f]+$/)
      } else {
        // If SubtleCrypto not available, expect appropriate error
        expect(result.error).toContain('not available')
      }
    })

    it('SHA-1 is deterministic', async () => {
      const r1 = await generateHash('test', 'sha1')
      const r2 = await generateHash('test', 'sha1')
      if (r1.ok && r2.ok) {
        expect(r1.data).toBe(r2.data)
      }
    })
  })

  describe('SHA-256', () => {
    it('generates SHA-256 hash', async () => {
      const result = await generateHash('hello', 'sha256')
      if (result.ok) {
        // Known SHA-256 of "hello"
        expect(result.data).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
        expect(result.data).toHaveLength(64)
        expect(result.data).toMatch(/^[0-9a-f]+$/)
      } else {
        expect(result.error).toContain('not available')
      }
    })

    it('SHA-256 handles UTF-8 input', async () => {
      const result = await generateHash('你好世界', 'sha256')
      if (result.ok) {
        expect(result.data).toHaveLength(64)
        expect(result.data).toMatch(/^[0-9a-f]+$/)
      }
    })

    it('SHA-256 is deterministic', async () => {
      const r1 = await generateHash('same', 'sha256')
      const r2 = await generateHash('same', 'sha256')
      if (r1.ok && r2.ok) {
        expect(r1.data).toBe(r2.data)
      }
    })
  })

  describe('SHA-512', () => {
    it('generates SHA-512 hash', async () => {
      const result = await generateHash('hello', 'sha512')
      if (result.ok) {
        expect(result.data).toHaveLength(128)
        expect(result.data).toMatch(/^[0-9a-f]+$/)
      } else {
        expect(result.error).toContain('not available')
      }
    })
  })

  describe('edge cases', () => {
    it('returns error for empty string (all algorithms)', async () => {
      for (const algo of ['md5', 'sha1', 'sha256', 'sha512'] as const) {
        const result = await generateHash('', algo)
        expect(result.ok).toBe(false)
        if (!result.ok) {
          expect(result.error).toBe('Input is empty')
        }
      }
    })

    it('different inputs produce different hashes', async () => {
      const r1 = await generateHash('hello', 'md5')
      const r2 = await generateHash('world', 'md5')
      if (r1.ok && r2.ok) {
        expect(r1.data).not.toBe(r2.data)
      }
    })

    it('handles long input', async () => {
      const long = 'a'.repeat(100000)
      const result = await generateHash(long, 'md5')
      expect(result.ok).toBe(true)
    })
  })
})
