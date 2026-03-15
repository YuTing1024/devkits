import type { ToolResult } from '../types.js'

export interface JsonToTypescriptOptions {
  rootName?: string
  useInterface?: boolean
}

export function jsonToTypescript(
  input: string,
  options?: JsonToTypescriptOptions
): ToolResult<string> {
  if (input.trim() === '') {
    return { ok: false, error: 'Input is empty' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` }
  }

  const rootName = options?.rootName ?? 'Root'
  const useInterface = options?.useInterface ?? true

  try {
    const definitions: string[] = []
    generateTypeDefinition(parsed, rootName, useInterface, definitions)
    const result = definitions.join('\n\n')
    return { ok: true, data: result }
  } catch (e) {
    return { ok: false, error: `Failed to generate TypeScript: ${(e as Error).message}` }
  }
}

function generateTypeDefinition(
  value: unknown,
  name: string,
  useInterface: boolean,
  definitions: string[]
): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'unknown[]'
    }
    // Merge all element types
    const elementType = getArrayElementType(value, name, useInterface, definitions)
    return `${elementType}[]`
  }

  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const fields = Object.entries(obj)

    if (fields.length === 0) {
      const keyword = useInterface ? 'interface' : 'type'
      const body = useInterface ? `${name} {\n  [key: string]: unknown\n}` : `${name} = Record<string, unknown>`
      const def = `export ${keyword} ${body}`
      if (!definitions.includes(def)) {
        definitions.push(def)
      }
      return name
    }

    const lines: string[] = []
    for (const [key, val] of fields) {
      const safeName = sanitizeKey(key)
      const optional = val === null || val === undefined ? '?' : ''
      const fieldType = getFieldType(val, capitalize(safeName), useInterface, definitions)
      lines.push(`  ${safeName}${optional}: ${fieldType}`)
    }

    const keyword = useInterface ? 'interface' : 'type'
    const body = useInterface
      ? `${name} {\n${lines.join('\n')}\n}`
      : `${name} = {\n${lines.join('\n')}\n}`
    const def = `export ${keyword} ${body}`
    if (!definitions.includes(def)) {
      definitions.push(def)
    }
    return name
  }

  return getPrimitiveType(value)
}

function getArrayElementType(
  arr: unknown[],
  parentName: string,
  useInterface: boolean,
  definitions: string[]
): string {
  const types = new Set<string>()

  for (const item of arr) {
    if (Array.isArray(item)) {
      const innerName = `${parentName}Item`
      const t = generateTypeDefinition(item, innerName, useInterface, definitions)
      types.add(t)
    } else if (item !== null && typeof item === 'object') {
      const innerName = `${parentName}Item`
      generateTypeDefinition(item, innerName, useInterface, definitions)
      types.add(innerName)
    } else {
      types.add(getPrimitiveType(item))
    }
  }

  if (types.size === 1) {
    return [...types][0]
  }
  return [...types].join(' | ')
}

function getFieldType(
  value: unknown,
  childName: string,
  useInterface: boolean,
  definitions: string[]
): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'unknown[]'
    }
    const elementType = getArrayElementType(value, childName, useInterface, definitions)
    return `${elementType}[]`
  }

  if (value !== null && typeof value === 'object') {
    generateTypeDefinition(value, childName, useInterface, definitions)
    return childName
  }

  if (value === null) {
    return 'null'
  }

  return getPrimitiveType(value)
}

function getPrimitiveType(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  switch (typeof value) {
    case 'string': return 'string'
    case 'number': return 'number'
    case 'boolean': return 'boolean'
    default: return 'unknown'
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function sanitizeKey(key: string): string {
  // If key contains special chars or starts with a digit, wrap in quotes
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
    return key
  }
  return `"${key}"`
}
