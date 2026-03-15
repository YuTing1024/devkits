import type { ToolResult } from '../types.js'

const MAX_INPUT_SIZE = 1024 * 1024 // 1MB

export function formatJson(
  input: string,
  options?: { indent?: number | 'tab'; sortKeys?: boolean }
): ToolResult<string> {
  if (input.trim() === '') {
    return { ok: false, error: 'Input is empty' }
  }

  if (input.length > MAX_INPUT_SIZE) {
    return { ok: false, error: 'Input exceeds 1MB limit' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` }
  }

  const indent = options?.indent === 'tab' ? '\t' : (options?.indent ?? 2)

  if (options?.sortKeys) {
    parsed = sortKeysDeep(parsed)
  }

  try {
    const result = JSON.stringify(parsed, null, indent)
    return { ok: true, data: result }
  } catch (e) {
    return { ok: false, error: `Failed to stringify: ${(e as Error).message}` }
  }
}

export function validateJson(input: string): ToolResult<{ valid: true }> {
  if (input.trim() === '') {
    return { ok: false, error: 'Input is empty' }
  }

  if (input.length > MAX_INPUT_SIZE) {
    return { ok: false, error: 'Input exceeds 1MB limit' }
  }

  try {
    JSON.parse(input)
    return { ok: true, data: { valid: true } }
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` }
  }
}

function sortKeysDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortKeysDeep)
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((obj as Record<string, unknown>)[key])
    }
    return sorted
  }
  return obj
}
