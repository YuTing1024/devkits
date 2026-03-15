import { useState } from 'react';
import { formatJson } from '@devkits/core';
import CopyButton from './CopyButton';

export default function JsonFormatterTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  function handleFormat() {
    setError('');
    const result = formatJson(input, { indent: 2 });
    if (result.ok) {
      setOutput(result.data);
    } else {
      setError(result.error);
      setOutput('');
    }
  }

  function handleMinify() {
    setError('');
    const result = formatJson(input, { indent: 0 });
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

  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="w-full rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm font-mono resize-none"
        rows={6}
        placeholder="Paste JSON here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={handleFormat}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
        >
          Format
        </button>
        <button
          onClick={handleMinify}
          className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs px-3 py-1.5 rounded transition-colors"
        >
          Minify
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
