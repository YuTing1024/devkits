import { useState } from 'react';
import { toggleTheme } from '../../lib/theme';
import JsonFormatterTool from '../../components/JsonFormatterTool';
import Base64Tool from '../../components/Base64Tool';
import UuidGeneratorTool from '../../components/UuidGeneratorTool';

type Tab = 'json' | 'base64' | 'uuid';

const TABS: { id: Tab; label: string }[] = [
  { id: 'json', label: 'JSON' },
  { id: 'base64', label: 'Base64' },
  { id: 'uuid', label: 'UUID' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('json');
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  function handleThemeToggle() {
    toggleTheme();
    setIsDark(document.documentElement.classList.contains('dark'));
  }

  return (
    <div className="w-[400px] max-h-[500px] flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
          &lt;/&gt; DevKits
        </span>
        <button
          onClick={handleThemeToggle}
          className="p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-xs font-medium py-2 transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tool Content */}
      <div className="flex-1 p-3 overflow-y-auto">
        {activeTab === 'json' && <JsonFormatterTool />}
        {activeTab === 'base64' && <Base64Tool />}
        {activeTab === 'uuid' && <UuidGeneratorTool />}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <a
          href="https://devkits.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Open full site →
        </a>
      </div>
    </div>
  );
}
