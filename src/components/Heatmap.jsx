import { useMemo } from 'react'
import { SectionLabel } from './ui.jsx'
import { addDays, parseKey, shortDate, toKey } from '../lib/date.js'

const WEEKS = 12
const LEVEL_MIX = [0, 16, 36, 62, 100]
const levelOf = (n) => (n <= 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n === 3 ? 3 : 4)
const cellColor = (lvl) =>
  lvl === 0 ? 'var(--heat-0)' : `color-mix(in srgb, var(--accent) ${LEVEL_MIX[lvl]}%, var(--surface))`

const ROW_LABELS = ['T2', '', 'T4', '', 'T6', '', 'CN']

export default function Heatmap({ habitLog, tasks, today }) {
  const { days, total, activeDays } = useMemo(() => {
    const counts = {}
    Object.entries(habitLog).forEach(([k, ids]) => (counts[k] = (counts[k] || 0) + ids.length))
    tasks.forEach((t) => t.done && t.doneAt && (counts[t.doneAt] = (counts[t.doneAt] || 0) + 1))

    const t = parseKey(today)
    const mondayOffset = (t.getDay() + 6) % 7
    t.setDate(t.getDate() - mondayOffset - (WEEKS - 1) * 7)
    const start = toKey(t)

    let total = 0
    let activeDays = 0
    const days = Array.from({ length: WEEKS * 7 }, (_, i) => {
      const key = addDays(start, i)
      const future = key > today
      const n = future ? 0 : counts[key] || 0
      total += n
      if (n) activeDays++
      return { key, n, future }
    })
    return { days, total, activeDays }
  }, [habitLog, tasks, today])

  return (
    <section aria-labelledby="heat-h" className="px-4 py-4">
      <SectionLabel right={<span className="num text-[11px] text-subtle">{WEEKS} tuần</span>}>
        <span id="heat-h">Hoạt động</span>
      </SectionLabel>

      <div className="mt-3 flex gap-2">
        <div className="grid grid-rows-7 gap-[3px] font-mono text-[9px] leading-none text-subtle" aria-hidden>
          {ROW_LABELS.map((l, i) => (
            <span key={i} className="flex items-center">
              {l}
            </span>
          ))}
        </div>
        <div
          className="grid flex-1 gap-[3px]"
          style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))', gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))`, gridAutoFlow: 'column' }}
          role="img"
          aria-label={`${total} lượt hoàn thành trong ${WEEKS} tuần, ${activeDays} ngày có hoạt động`}
        >
          {days.map((d) => (
            <span
              key={d.key}
              title={d.future ? undefined : `${shortDate(d.key)}: ${d.n} hoàn thành`}
              className={`aspect-square rounded-[2px] ${d.key === today ? 'outline outline-1 outline-offset-1 outline-muted' : ''}`}
              style={{ background: d.future ? 'transparent' : cellColor(levelOf(d.n)) }}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-subtle">
        <span className="num">
          <span className="text-fg">{total}</span> lượt · <span className="text-fg">{activeDays}</span> ngày
        </span>
        <span className="flex items-center gap-[3px]" aria-hidden>
          Ít
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className="mx-px h-2.5 w-2.5 rounded-[2px]" style={{ background: cellColor(l) }} />
          ))}
          Nhiều
        </span>
      </div>
    </section>
  )
}
