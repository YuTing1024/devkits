import { describe, it, expect } from 'vitest'
import { yamlToJson, jsonToYaml } from './yaml-json.js'

describe('yamlToJson', () => {
  it('converts simple YAML to JSON', () => {
    const result = yamlToJson('name: Alice\nage: 30')
    expect(result.ok).toBe(true)
    if (result.ok) {
      const parsed = JSON.parse(result.data)
      expect(parsed.name).toBe('Alice')
      expect(parsed.age).toBe(30)
    }
  })

  it('converts YAML list to JSON array', () => {
    const result = yamlToJson('- a\n- b\n- c')
    expect(result.ok).toBe(true)
    if (result.ok) {
      const parsed = JSON.parse(result.data)
      expect(parsed).toEqual(['a', 'b', 'c'])
    }
  })

  it('handles nested YAML', () => {
    const yaml = 'user:\n  name: Bob\n  age: 25'
    const result = yamlToJson(yaml)
    expect(result.ok).toBe(true)
    if (result.ok) {
      const parsed = JSON.parse(result.data)
      expect(parsed.user.name).toBe('Bob')
    }
  })

  it('uses custom indent', () => {
    const result = yamlToJson('name: Alice', { indent: 4 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('    ')
    }
  })

  it('returns error for empty input', () => {
    const result = yamlToJson('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Input is empty')
    }
  })

  it('returns error for whitespace-only input', () => {
    const result = yamlToJson('   ')
    expect(result.ok).toBe(false)
  })

  it('returns error for invalid YAML', () => {
    const result = yamlToJson(': invalid: yaml: [unclosed')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid YAML')
    }
  })
})

describe('jsonToYaml', () => {
  it('converts simple JSON to YAML', () => {
    const result = jsonToYaml('{"name":"Alice","age":30}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('name: Alice')
      expect(result.data).toContain('age: 30')
    }
  })

  it('converts JSON array to YAML list', () => {
    const result = jsonToYaml('["a","b","c"]')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('- a')
      expect(result.data).toContain('- b')
    }
  })

  it('handles nested JSON', () => {
    const result = jsonToYaml('{"user":{"name":"Bob","age":25}}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('user:')
      expect(result.data).toContain('name: Bob')
    }
  })

  it('returns error for empty input', () => {
    const result = jsonToYaml('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Input is empty')
    }
  })

  it('returns error for invalid JSON', () => {
    const result = jsonToYaml('{bad json}')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid JSON')
    }
  })

  it('handles boolean and null values', () => {
    const result = jsonToYaml('{"active":true,"deleted":null}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toContain('active: true')
    }
  })
})
