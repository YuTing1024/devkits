import { md5 } from 'js-md5'
import type { ToolResult } from '../types.js'

type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512'

const SHA_ALGO_MAP: Record<string, string> = {
  sha1: 'SHA-1',
  sha256: 'SHA-256',
  sha512: 'SHA-512',
}

export async function generateHash(
  input: string,
  algorithm: HashAlgorithm
): Promise<ToolResult<string>> {
  if (input === '') {
    return { ok: false, error: 'Input is empty' }
  }

  if (algorithm === 'md5') {
    try {
      const hash = md5(input)
      return { ok: true, data: hash }
    } catch (e) {
      return { ok: false, error: `MD5 hashing failed: ${(e as Error).message}` }
    }
  }

  // SHA variants via SubtleCrypto
  const subtleName = SHA_ALGO_MAP[algorithm]
  if (!subtleName) {
    return { ok: false, error: `Unsupported algorithm: ${algorithm}` }
  }

  // Check for SubtleCrypto availability (may not be present in all environments)
  const subtle =
    typeof globalThis !== 'undefined' && globalThis.crypto
      ? globalThis.crypto.subtle
      : typeof crypto !== 'undefined'
        ? crypto.subtle
        : undefined

  if (!subtle) {
    return { ok: false, error: 'SubtleCrypto is not available in this environment' }
  }

  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await subtle.digest(subtleName, data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return { ok: true, data: hashHex }
  } catch (e) {
    return { ok: false, error: `Hashing failed: ${(e as Error).message}` }
  }
}
