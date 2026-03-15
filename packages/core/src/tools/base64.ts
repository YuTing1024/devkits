import type { ToolResult } from '../types.js'

export function encodeBase64(input: string): ToolResult<string> {
  if (input === '') {
    return { ok: false, error: 'Input is empty' }
  }

  try {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(input)
    // Convert Uint8Array to base64 via btoa
    let binary = ''
    for (const byte of bytes) {
      binary += String.fromCharCode(byte)
    }
    const encoded = btoa(binary)
    return { ok: true, data: encoded }
  } catch (e) {
    return { ok: false, error: `Encoding failed: ${(e as Error).message}` }
  }
}

export function decodeBase64(input: string): ToolResult<string> {
  if (input === '') {
    return { ok: false, error: 'Input is empty' }
  }

  // Validate base64 characters (standard + URL-safe variants stripped of padding)
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  // Strip whitespace before validation (common in pasted base64)
  const trimmed = input.replace(/\s/g, '')

  if (!base64Regex.test(trimmed)) {
    return { ok: false, error: 'Invalid base64: contains illegal characters' }
  }

  try {
    const binary = atob(trimmed)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const decoder = new TextDecoder('utf-8', { fatal: true })
    const decoded = decoder.decode(bytes)
    return { ok: true, data: decoded }
  } catch (e) {
    // Could be binary content that can't be decoded as UTF-8
    return { ok: false, error: `Decoding failed: content is not valid UTF-8 text` }
  }
}
