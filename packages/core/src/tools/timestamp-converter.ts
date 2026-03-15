import type { ToolResult } from '../types.js'

export interface TimestampResult {
  iso: string
  utc: string
  local: string
  relative: string
}

export interface TimestampFromDate {
  seconds: number
  milliseconds: number
}

export function timestampToDate(input: number | string): ToolResult<TimestampResult> {
  let numInput: number

  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (trimmed === '') {
      return { ok: false, error: 'Input is empty' }
    }
    const parsed = Number(trimmed)
    if (isNaN(parsed)) {
      return { ok: false, error: 'Invalid timestamp: not a number' }
    }
    numInput = parsed
  } else {
    numInput = input
  }

  // Auto-detect seconds vs milliseconds: if > 1e12, treat as ms
  const ms = numInput > 1e12 ? numInput : numInput * 1000

  const date = new Date(ms)

  if (isNaN(date.getTime())) {
    return { ok: false, error: 'Invalid timestamp: resulting date is invalid' }
  }

  const now = Date.now()
  const diffMs = now - ms
  const relative = formatRelative(diffMs)

  return {
    ok: true,
    data: {
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
      relative,
    },
  }
}

export function dateToTimestamp(input: string): ToolResult<TimestampFromDate> {
  if (input.trim() === '') {
    return { ok: false, error: 'Input is empty' }
  }

  const date = new Date(input)

  if (isNaN(date.getTime())) {
    return { ok: false, error: 'Invalid date string' }
  }

  const ms = date.getTime()
  return {
    ok: true,
    data: {
      seconds: Math.floor(ms / 1000),
      milliseconds: ms,
    },
  }
}

export function getCurrentTimestamp(): TimestampFromDate {
  const ms = Date.now()
  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
  }
}

function formatRelative(diffMs: number): string {
  const abs = Math.abs(diffMs)
  const isFuture = diffMs < 0

  const seconds = Math.floor(abs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  let label: string
  if (seconds < 60) {
    label = seconds <= 1 ? 'just now' : `${seconds} seconds ago`
  } else if (minutes < 60) {
    label = minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
  } else if (hours < 24) {
    label = hours === 1 ? '1 hour ago' : `${hours} hours ago`
  } else if (days < 30) {
    label = days === 1 ? '1 day ago' : `${days} days ago`
  } else if (months < 12) {
    label = months === 1 ? '1 month ago' : `${months} months ago`
  } else {
    label = years === 1 ? '1 year ago' : `${years} years ago`
  }

  if (isFuture) {
    label = label.replace(' ago', '').replace('just now', 'just now')
    if (label !== 'just now') {
      label = `in ${label}`
    }
  }

  return label
}
