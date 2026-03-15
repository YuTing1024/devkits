import type { ToolResult } from '../types.js'

type UrlMode = 'component' | 'full'

export function encodeUrl(input: string, mode: UrlMode = 'component'): ToolResult<string> {
  if (input === '') {
    return { ok: false, error: 'Input is empty' }
  }

  try {
    const encoded = mode === 'full' ? encodeURI(input) : encodeURIComponent(input)
    return { ok: true, data: encoded }
  } catch (e) {
    return { ok: false, error: `Encoding failed: ${(e as Error).message}` }
  }
}

export function decodeUrl(input: string, mode: UrlMode = 'component'): ToolResult<string> {
  if (input === '') {
    return { ok: false, error: 'Input is empty' }
  }

  try {
    const decoded = mode === 'full' ? decodeURI(input) : decodeURIComponent(input)
    return { ok: true, data: decoded }
  } catch (e) {
    return { ok: false, error: `Decoding failed: ${(e as Error).message}` }
  }
}
