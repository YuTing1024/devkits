import { useState } from 'react';
import { generateUuid } from '@devkits/core';
import CopyButton from './CopyButton';

type Version = 'v4' | 'v7';

export default function UuidGeneratorTool() {
  const [version, setVersion] = useState<Version>('v4');
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [error, setError] = useState('');

  function handleGenerate() {
    setError('');
    const result = generateUuid({ version, count });
    if (result.ok) {
      setUuids(result.data);
    } else {
      setError(result.error);
      setUuids([]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Controls */}
      <div className="flex gap-2 items-center">
        <select
          value={version}
          onChange={(e) => setVersion(e.target.value as Version)}
          className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs px-2 py-1.5"
        >
          <option value="v4">v4 (random)</option>
          <option value="v7">v7 (time-ordered)</option>
        </select>

        <input
          type="number"
          min={1}
          max={10}
          value={count}
          onChange={(e) => setCount(Math.min(10, Math.max(1, Number(e.target.value))))}
          className="w-16 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs px-2 py-1.5"
          title="Count (1-10)"
        />

        <button
          onClick={handleGenerate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
        >
          Generate
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      {uuids.length > 0 && (
        <>
          <div className="flex justify-end">
            <CopyButton
              getText={() => uuids.join('\n')}
              label="Copy All"
            />
          </div>

          <div className="flex flex-col gap-1">
            {uuids.map((uuid, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1"
              >
                <span className="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                  {uuid}
                </span>
                <CopyButton getText={() => uuid} label="Copy" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
