import { useEffect } from 'react'

export function useKeyboardShortcut(
  key: string,
  handler: (e: KeyboardEvent) => void,
  options?: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }
): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const matchesKey = e.key.toLowerCase() === key.toLowerCase()
      const matchesCtrl = options?.ctrlKey ? (e.ctrlKey || e.metaKey) : true
      const matchesMeta = options?.metaKey ? e.metaKey : true
      const matchesShift = options?.shiftKey ? e.shiftKey : true

      if (matchesKey && matchesCtrl && matchesMeta && matchesShift) {
        handler(e)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, handler, options?.ctrlKey, options?.metaKey, options?.shiftKey])
}
