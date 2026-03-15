import type { ToolResult } from '../types.js'
import { CronExpressionParser } from 'cron-parser'

export interface CronParseResult {
  description: string
  nextRuns: string[]
}

export function parseCron(expression: string): ToolResult<CronParseResult> {
  if (expression.trim() === '') {
    return { ok: false, error: 'Expression is empty' }
  }

  let expr: ReturnType<typeof CronExpressionParser.parse>
  try {
    expr = CronExpressionParser.parse(expression.trim())
  } catch (e) {
    return { ok: false, error: `Invalid cron expression: ${(e as Error).message}` }
  }

  const nextRuns = expr.take(5).map((d) => d.toISOString() ?? '')
  const description = describeCron(expression.trim())

  return {
    ok: true,
    data: {
      description,
      nextRuns,
    },
  }
}

export function describeCron(expression: string): string {
  const parts = expression.trim().split(/\s+/)

  if (parts.length < 5 || parts.length > 6) {
    return 'Custom schedule'
  }

  // Handle 5-part (standard) and 6-part (with seconds) cron
  let minute: string, hour: string, dom: string, month: string, dow: string

  if (parts.length === 6) {
    // With seconds: second minute hour dom month dow
    ;[, minute, hour, dom, month, dow] = parts
  } else {
    ;[minute, hour, dom, month, dow] = parts
  }

  // Common patterns
  if (minute === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    return 'Every minute'
  }

  if (minute === '0' && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    return 'At the start of every hour'
  }

  if (minute === '0' && hour === '0' && dom === '*' && month === '*' && dow === '*') {
    return 'Every day at midnight'
  }

  if (minute === '0' && hour === '0' && dom === '*' && month === '*' && dow === '0') {
    return 'Every Sunday at midnight'
  }

  if (minute === '0' && hour === '0' && dom === '1' && month === '*' && dow === '*') {
    return 'At midnight on the first day of every month'
  }

  if (minute === '0' && hour === '0' && dom === '1' && month === '1' && dow === '*') {
    return 'At midnight on January 1st every year'
  }

  // Step patterns
  if (minute.startsWith('*/') && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    const step = minute.slice(2)
    return `Every ${step} minutes`
  }

  if (minute === '0' && hour.startsWith('*/') && dom === '*' && month === '*' && dow === '*') {
    const step = hour.slice(2)
    return `Every ${step} hours`
  }

  // Range patterns
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const dowNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const parts2: string[] = []

  // Minute description
  if (minute === '*') {
    parts2.push('every minute')
  } else if (minute.startsWith('*/')) {
    parts2.push(`every ${minute.slice(2)} minutes`)
  } else if (!isNaN(Number(minute))) {
    parts2.push(`at minute ${minute}`)
  }

  // Hour description
  if (hour === '*') {
    parts2.push('every hour')
  } else if (hour.startsWith('*/')) {
    parts2.push(`every ${hour.slice(2)} hours`)
  } else if (!isNaN(Number(hour))) {
    const h = Number(hour)
    const ampm = h === 0 ? '12:00 AM' : h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`
    parts2.push(`at ${ampm}`)
  }

  // Day of month
  if (dom !== '*') {
    if (!isNaN(Number(dom))) {
      parts2.push(`on the ${ordinal(Number(dom))} of the month`)
    }
  }

  // Month
  if (month !== '*') {
    if (!isNaN(Number(month))) {
      const m = Number(month)
      if (m >= 1 && m <= 12) {
        parts2.push(`in ${monthNames[m]}`)
      }
    }
  }

  // Day of week
  if (dow !== '*') {
    if (!isNaN(Number(dow))) {
      const d = Number(dow) % 7
      parts2.push(`on ${dowNames[d]}`)
    }
  }

  if (parts2.length === 0) {
    return 'Custom schedule'
  }

  return parts2
    .join(', ')
    .replace(/^(.)/, (c: string) => c.toUpperCase())
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
