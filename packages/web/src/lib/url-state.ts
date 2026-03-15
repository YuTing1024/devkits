import LZString from 'lz-string'

const MAX_INPUT_BYTES = 10 * 1024 // 10KB

export function encodeState(input: string): string {
  if (new TextEncoder().encode(input).length > MAX_INPUT_BYTES) {
    throw new Error('Input exceeds 10KB limit for URL state')
  }
  return LZString.compressToEncodedURIComponent(input)
}

export function decodeState(param: string): string | null {
  if (!param) return null
  try {
    const decoded = LZString.decompressFromEncodedURIComponent(param)
    return decoded || null
  } catch {
    return null
  }
}
