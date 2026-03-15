import type { ToolResult } from '../types.js'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export interface ImageFile {
  data: Uint8Array
  type: string
  name: string
}

export interface ImageToBase64Result {
  base64: string
  dataUri: string
  cssBackground: string
  imgTag: string
}

export function imageFileToBase64(file: ImageFile): ToolResult<ImageToBase64Result> {
  if (!file.type || !file.type.startsWith('image/')) {
    return { ok: false, error: `Invalid file type: "${file.type}". Must be an image MIME type (e.g. image/png)` }
  }

  if (file.data.length === 0) {
    return { ok: false, error: 'File data is empty' }
  }

  if (file.data.length > MAX_FILE_SIZE) {
    const sizeMb = (file.data.length / (1024 * 1024)).toFixed(2)
    return { ok: false, error: `File size (${sizeMb}MB) exceeds the 5MB limit` }
  }

  let base64: string
  try {
    base64 = uint8ArrayToBase64(file.data)
  } catch (e) {
    return { ok: false, error: `Failed to encode file: ${(e as Error).message}` }
  }

  const dataUri = `data:${file.type};base64,${base64}`
  const cssBackground = `background-image: url('${dataUri}');`
  const imgTag = `<img src="${dataUri}" alt="${escapeHtml(file.name)}" />`

  return {
    ok: true,
    data: {
      base64,
      dataUri,
      cssBackground,
      imgTag,
    },
  }
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  // Process in chunks to avoid stack overflow on large files
  const CHUNK_SIZE = 0x8000 // 32768
  let binary = ''
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
