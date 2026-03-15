import type { ReactNode } from 'react'

interface DualPanelProps {
  left: ReactNode
  right: ReactNode
}

export default function DualPanel({ left, right }: DualPanelProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <div className="flex-1 min-w-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {left}
      </div>
      <div className="flex-1 min-w-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {right}
      </div>
    </div>
  )
}
