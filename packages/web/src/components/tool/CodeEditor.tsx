import { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: 'json' | 'text'
  readOnly?: boolean
  placeholder?: string
  minHeight?: string
}

export default function CodeEditor({
  value,
  onChange,
  language = 'text',
  readOnly = false,
  placeholder,
  minHeight = '200px',
}: CodeEditorProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const extensions = [
    EditorView.lineWrapping,
    ...(language === 'json' ? [json()] : []),
  ]

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      theme={isDark ? 'dark' : 'light'}
      extensions={extensions}
      style={{ minHeight }}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        dropCursor: false,
        allowMultipleSelections: false,
        indentOnInput: false,
      }}
    />
  )
}
