export type ToolResult<T> = { ok: true; data: T } | { ok: false; error: string }

export interface ToolMeta {
  name: string
  slug: string
  description: string
  keywords: string[]
  category: 'formatters' | 'encoders' | 'generators'
}
