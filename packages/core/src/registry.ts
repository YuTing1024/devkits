import type { ToolMeta } from './types.js'

export const toolRegistry: ToolMeta[] = [
  // Batch 1 — formatters
  {
    name: 'JSON Formatter',
    slug: 'json-formatter',
    description: 'Format and validate JSON with configurable indentation and key sorting.',
    keywords: ['json', 'format', 'beautify', 'pretty print', 'validate', 'lint'],
    category: 'formatters',
  },
  // Batch 1 — encoders
  {
    name: 'Base64 Encoder / Decoder',
    slug: 'base64',
    description: 'Encode and decode text using Base64 with full UTF-8 support.',
    keywords: ['base64', 'encode', 'decode', 'binary', 'utf-8'],
    category: 'encoders',
  },
  {
    name: 'URL Encoder / Decoder',
    slug: 'url-encoder',
    description: 'Percent-encode and decode URLs using component or full encoding modes.',
    keywords: ['url', 'encode', 'decode', 'percent', 'uri', 'query string'],
    category: 'encoders',
  },
  // Batch 1 — generators
  {
    name: 'UUID Generator',
    slug: 'uuid-generator',
    description: 'Generate UUID v4 or v7 identifiers, one or in bulk.',
    keywords: ['uuid', 'guid', 'unique id', 'v4', 'v7', 'identifier'],
    category: 'generators',
  },
  {
    name: 'Hash Generator',
    slug: 'hash-generator',
    description: 'Compute MD5, SHA-1, SHA-256, or SHA-512 hashes for any text input.',
    keywords: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'checksum', 'digest'],
    category: 'generators',
  },
  // Batch 2 — formatters
  {
    name: 'JSON to TypeScript',
    slug: 'json-to-typescript',
    description: 'Generate TypeScript interface or type definitions from JSON input.',
    keywords: ['json', 'typescript', 'interface', 'type', 'convert', 'codegen'],
    category: 'formatters',
  },
  {
    name: 'Timestamp Converter',
    slug: 'timestamp-converter',
    description: 'Convert Unix timestamps to human-readable dates and vice versa.',
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'convert'],
    category: 'formatters',
  },
  // Batch 2 — generators
  {
    name: 'Cron Expression Generator',
    slug: 'cron-generator',
    description: 'Parse and describe cron expressions, and preview the next scheduled runs.',
    keywords: ['cron', 'schedule', 'expression', 'job', 'time', 'crontab'],
    category: 'generators',
  },
  // Batch 2 — encoders
  {
    name: 'YAML ↔ JSON Converter',
    slug: 'yaml-json',
    description: 'Convert between YAML and JSON formats with pretty-printed output.',
    keywords: ['yaml', 'json', 'convert', 'format', 'transform'],
    category: 'encoders',
  },
  {
    name: 'Image to Base64',
    slug: 'image-to-base64',
    description: 'Convert image files to Base64 data URIs for use in HTML, CSS, or code.',
    keywords: ['image', 'base64', 'data uri', 'encode', 'embed', 'css', 'html'],
    category: 'encoders',
  },
]

export function getToolMeta(slug: string): ToolMeta | undefined {
  return toolRegistry.find(tool => tool.slug === slug)
}
