import { useState } from 'react';
import { encodeBase64, decodeBase64 } from '@devkits/core';
import CopyButton from './CopyButton';

type Mode = 'encode' | 'decode';

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  function handleExecute() {
    setError('');
    const result = mode === 'encode' ? encodeBase64(input) : decodeBase64(input);
    if (result.ok) {
      setOutput(result.data);
    } else {
      setError(result.error);
      setOutput('');
    }
  }

  function handleClear() {
    setInput('');
    setOutput('');
    setError('');
  }

  function handleModeChange(newMode: Mode) {
    setMode(newMode);
    setInput('');
    setOutput('');
    setError('');
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Mode Toggle */}
      <div className="flex gap-1">
        {(['encode', 'decode'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 text-xs font-medium py-1.5 rounded capitalize transition-colors ${
              mode === m
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <textarea
        className="w-full rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm font-mono resize-none"
        rows={6}
        placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={handleExecute}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors capitalize"
        >
          {mode}
        </button>
        <CopyButton getText={() => output} label="Copy" />
        <button
          onClick={handleClear}
          className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs px-3 py-1.5 rounded transition-colors"
        >
          Clear
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      <textarea
        className="w-full rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm font-mono resize-none"
        rows={6}
        readOnly
        placeholder="Output will appear here..."
        value={output}
      />
    </div>
  );
}
