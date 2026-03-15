import { useState, useCallback, useRef } from 'react'
import { imageFileToBase64 } from '@devkits/core'
import CopyButton from '../components/ui/CopyButton'

type OutputTab = 'base64' | 'dataUri' | 'css' | 'imgTag'

const TAB_LABELS: { key: OutputTab; label: string }[] = [
  { key: 'base64', label: 'Raw Base64' },
  { key: 'dataUri', label: 'Data URI' },
  { key: 'css', label: 'CSS Background' },
  { key: 'imgTag', label: '<img> Tag' },
]

export default function ImageToBase64Island() {
  const [result, setResult] = useState<{
    base64: string
    dataUri: string
    cssBackground: string
    imgTag: string
  } | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activeTab, setActiveTab] = useState<OutputTab>('dataUri')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      return
    }
    setError(null)
    setFileName(file.name)

    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)

    const res = imageFileToBase64({ data, type: file.type, name: file.name })
    if (res.ok) {
      setResult(res.data)
      setPreview(res.data.dataUri)
    } else {
      setError(res.error)
      setResult(null)
      setPreview(null)
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const getActiveOutput = useCallback(() => {
    if (!result) return ''
    switch (activeTab) {
      case 'base64': return result.base64
      case 'dataUri': return result.dataUri
      case 'css': return result.cssBackground
      case 'imgTag': return result.imgTag
    }
  }, [result, activeTab])

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
        />
        <svg
          className={`w-12 h-12 ${isDragging ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDragging ? 'Drop your image here' : 'Drag & drop an image, or click to browse'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            PNG, JPG, GIF, SVG, WebP and other formats supported
          </p>
        </div>
        {fileName && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {fileName}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          {error}
        </div>
      )}

      {result && preview && (
        <div className="space-y-4">
          {/* Preview */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="shrink-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Preview</p>
              <div className="w-32 h-32 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAUSURBVDiNY2AgFjBiMBARAAD//wMABAAF/moUkwAAAABJRU5ErkJggg==')] bg-repeat">
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">File info</p>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <p><span className="text-gray-500 dark:text-gray-400">Name: </span>{fileName}</p>
                <p><span className="text-gray-500 dark:text-gray-400">Base64 size: </span>{(result.base64.length / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          </div>

          {/* Output tabs */}
          <div>
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit mb-3 flex-wrap">
              {TAB_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === key
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <CopyButton text={getActiveOutput()} />
              </div>
              <textarea
                value={getActiveOutput()}
                readOnly
                rows={6}
                className="w-full px-3 py-2 pr-20 font-mono text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg resize-y focus:outline-none text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      )}

      {!result && !error && (
        <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
          Upload an image to get the Base64 output
        </div>
      )}
    </div>
  )
}
