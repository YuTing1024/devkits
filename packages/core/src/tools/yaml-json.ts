import type { ToolResult } from '../types.js'
import { parse as yamlParse, stringify as yamlStringify } from 'yaml'

export function yamlToJson(input: string, options?: { indent?: number }): ToolResult<string> {
  if (input.trim() === '') {
    return { ok: false, error: 'Input is empty' }
  }

  let parsed: unknown
  try {
    parsed = yamlParse(input)
  } catch (e) {
    return { ok: false, error: `Invalid YAML: ${(e as Error).message}` }
  }

  const indent = options?.indent ?? 2

  try {
    const result = JSON.stringify(parsed, null, indent)
    return { ok: true, data: result }
  } catch (e) {
    return { ok: false, error: `Failed to convert to JSON: ${(e as Error).message}` }
  }
}

export function jsonToYaml(input: string): ToolResult<string> {
  if (input.trim() === '') {
    return { ok: false, error: 'Input is empty' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` }
  }

  try {
    const result = yamlStringify(parsed)
    return { ok: true, data: result }
  } catch (e) {
    return { ok: false, error: `Failed to convert to YAML: ${(e as Error).message}` }
  }
}
