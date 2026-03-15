import { v4 as uuidv4, v7 as uuidv7 } from 'uuid'
import type { ToolResult } from '../types.js'

const MAX_COUNT = 100

export function generateUuid(options?: {
  version?: 'v4' | 'v7'
  count?: number
}): ToolResult<string[]> {
  const version = options?.version ?? 'v4'
  const count = options?.count ?? 1

  if (!Number.isInteger(count) || count < 1) {
    return { ok: false, error: 'count must be a positive integer' }
  }

  if (count > MAX_COUNT) {
    return { ok: false, error: `count exceeds maximum of ${MAX_COUNT}` }
  }

  try {
    const results: string[] = []
    for (let i = 0; i < count; i++) {
      results.push(version === 'v7' ? uuidv7() : uuidv4())
    }
    return { ok: true, data: results }
  } catch (e) {
    return { ok: false, error: `UUID generation failed: ${(e as Error).message}` }
  }
}
