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
  // Batch 2 — placeholders (future tools)
  {
    name: 'JWT Decoder',
    slug: 'jwt-decoder',
    description: 'Decode and inspect JSON Web Tokens without verification.',
    keywords: ['jwt', 'json web token', 'decode', 'auth', 'token'],
    category: 'encoders',
  },
  {
    name: 'Color Converter',
    slug: 'color-converter',
    description: 'Convert colors between HEX, RGB, HSL, and other formats.',
    keywords: ['color', 'hex', 'rgb', 'hsl', 'convert', 'css'],
    category: 'formatters',
  },
  {
    name: 'Regex Tester',
    slug: 'regex-tester',
    description: 'Test and debug regular expressions with live match highlighting.',
    keywords: ['regex', 'regexp', 'regular expression', 'test', 'match', 'pattern'],
    category: 'formatters',
  },
  {
    name: 'Timestamp Converter',
    slug: 'timestamp-converter',
    description: 'Convert Unix timestamps to human-readable dates and vice versa.',
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'convert'],
    category: 'formatters',
  },
  {
    name: 'Password Generator',
    slug: 'password-generator',
    description: 'Generate secure random passwords with configurable length and character sets.',
    keywords: ['password', 'generate', 'random', 'secure', 'strong'],
    category: 'generators',
  },
]

export function getToolMeta(slug: string): ToolMeta | undefined {
  return toolRegistry.find(tool => tool.slug === slug)
}
