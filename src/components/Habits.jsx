import { useState } from 'react'
import { Flame, Plus, Trash2 } from 'lucide-react'
import { SectionLabel, IconButton, Checkbox } from './ui.jsx'
import { addDays, shortDate } from '../lib/date.js'
import { streakOf } from '../lib/store.js'

export default function Habits({ habits, habitLog, today, onToggle, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const doneToday = habitLog[today] || []
  const doneCount = habits.filter((h) => doneToday.includes(h.id)).length
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))

  const submit = (e) => {
    e.preventDefault()
    if (draft.trim()) onAdd(draft.trim())
    setDraft('')
    setAdding(false)
  }

  return (
    <section aria-labelledby="habits-h">
      <SectionLabel
        right={
          <div className="flex items-center gap-2">
            <span className="num text-[12px] text-muted">
              {doneCount}/{habits.length}
            </span>
            <IconButton label="Thêm thói quen" onClick={() => setAdding((a) => !a)} className="h-6 w-6">
              <Plus size={14} strokeWidth={1.5} />
            </IconButton>
          </div>
        }
      >
        <span id="habits-h">Thói quen hằng ngày</span>
      </SectionLabel>

      <ul className="mt-2 divide-y divide-line border-y border-line">
        {habits.map((h) => {
          const checked = doneToday.includes(h.id)
          const streak = streakOf(habitLog, h.id, today)
          return (
            <li key={h.id} className="group flex min-h-11 items-center gap-3 py-2">
              <Checkbox checked={checked} onChange={() => onToggle(h.id)} label={`Hoàn thành: ${h.title}`} />
              <span className={`min-w-0 flex-1 text-[14px] ${checked ? 'text-muted line-through decoration-line-strong' : ''}`}>
                {h.title}
              </span>

              <span className="hidden items-center gap-[3px] sm:flex" aria-label="7 ngày gần nhất">
                {last7.map((d) => {
                  const on = (habitLog[d] || []).includes(h.id)
                  return (
                    <span
                      key={d}
                      title={`${shortDate(d)}: ${on ? 'đã làm' : 'chưa làm'}`}
                      className={`h-2.5 w-2.5 rounded-[2px] ${on ? 'bg-done' : 'bg-line'} ${d === today ? 'ring-1 ring-muted ring-offset-1 ring-offset-bg' : ''}`}
                    />
                  )
                })}
              </span>

              <span
                className={`flex w-16 items-center justify-end gap-1 ${streak > 0 ? 'text-fg' : 'text-subtle'}`}
                title={`Chuỗi ${streak} ngày liên tiếp`}
              >
                <Flame size={14} strokeWidth={1.5} className={streak > 0 ? 'text-accent' : ''} />
                <span className="num text-[13px]">{streak}</span>
                <span className="text-[11px] text-subtle">ngày</span>
              </span>

              <IconButton
                label={`Xoá thói quen: ${h.title}`}
                onClick={() => onDelete(h.id)}
                className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Trash2 size={14} strokeWidth={1.5} />
              </IconButton>
            </li>
          )
        })}
        {adding && (
          <li className="py-2">
            <form onSubmit={submit} className="flex gap-2">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
                placeholder="Ví dụ: Tập thể dục 20 phút"
                className="field min-w-0 flex-1"
              />
            </form>
          </li>
        )}
        {!habits.length && !adding && (
          <li className="py-3 text-[13px] text-muted">Chưa có thói quen nào. Bấm + để thêm thói quen đầu tiên.</li>
        )}
      </ul>
    </section>
  )
}
