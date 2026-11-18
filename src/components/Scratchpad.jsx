import { useEffect, useState } from 'react'
import { SectionLabel } from './ui.jsx'

export default function Scratchpad({ value, onChange }) {
  const [text, setText] = useState(value)
  const [savedAt, setSavedAt] = useState(null)

  // đồng bộ khi import JSON
  useEffect(() => setText(value), [value])

  useEffect(() => {
    if (text === value) return
    const t = setTimeout(() => {
      onChange(text)
      const d = new Date()
      setSavedAt(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    }, 400)
    return () => clearTimeout(t)
  }, [text, value, onChange])

  return (
    <section aria-labelledby="scratch-h" className="flex min-h-64 flex-1 flex-col px-4 py-4">
      <SectionLabel
        right={
          <span className="num text-[11px] text-subtle">
            {text !== value ? 'đang lưu…' : savedAt ? `đã lưu ${savedAt}` : 'tự lưu'}
          </span>
        }
      >
        <span id="scratch-h">Ghi chú nháp</span>
      </SectionLabel>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        aria-labelledby="scratch-h"
        placeholder="Dán link tài liệu, ý tưởng thuật toán, lệnh terminal…"
        className="mt-3 w-full flex-1 resize-none rounded border border-line bg-bg p-3 font-mono text-[12.5px] leading-relaxed focus:border-transparent focus:outline-2 focus:outline-offset-1 focus:outline-accent"
      />
      <p className="num mt-1.5 text-right text-[11px] text-subtle">{text.length} ký tự</p>
    </section>
  )
}
