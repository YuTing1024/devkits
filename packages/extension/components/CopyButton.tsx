import { useState, useCallback } from 'react';

interface CopyButtonProps {
  getText: () => string;
  className?: string;
  label?: string;
}

export default function CopyButton({ getText, className = '', label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write failed
    }
  }, [getText]);

  return (
    <button
      onClick={handleCopy}
      className={`bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs px-3 py-1.5 rounded transition-colors ${className}`}
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}
