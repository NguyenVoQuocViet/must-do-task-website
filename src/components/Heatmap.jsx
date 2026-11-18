import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { SectionLabel, Button } from './ui.jsx'
import { addDays, parseKey, shortDate, toKey } from '../lib/date.js'

const WEEKS = 12
const LEVEL_MIX = [0, 16, 36, 62, 100]
const levelOf = (n) => (n <= 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n === 3 ? 3 : 4)
const cellColor = (lvl) =>
  lvl === 0 ? 'var(--heat-0)' : `color-mix(in srgb, var(--accent) ${LEVEL_MIX[lvl]}%, var(--surface))`

const ROW_LABELS = ['T2', '', 'T4', '', 'T6', '', 'CN']

export default function Heatmap({ habits, habitLog, tasks, today, onReset }) {
  const [confirming, setConfirming] = useState(false)

  const { days, total, activeDays } = useMemo(() => {
    // chỉ đếm habit còn tồn tại: xoá habit thì lịch sử của nó cũng rời khỏi heatmap
    const alive = new Set(habits.map((h) => h.id))
    const counts = {}
    Object.entries(habitLog).forEach(([k, ids]) => {
      const n = ids.filter((id) => alive.has(id)).length
      if (n) counts[k] = (counts[k] || 0) + n
    })
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
  }, [habits, habitLog, tasks, today])

  return (
    <section aria-labelledby="heat-h" className="px-4 py-4">
      <SectionLabel
        right={
          <span className="flex items-center gap-2">
            <span className="num text-[11px] text-subtle">{WEEKS} tuần</span>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-expanded={confirming}
              title="Xoá lịch sử trước hôm nay"
              className={`inline-flex h-6 items-center gap-1 rounded px-1.5 text-[11px] transition-colors duration-150 hover:bg-hover ${
                confirming ? 'text-fg' : 'text-subtle hover:text-fg'
              }`}
            >
              <RotateCcw size={12} strokeWidth={1.5} />
              Đặt lại
            </button>
          </span>
        }
      >
        <span id="heat-h">Hoạt động</span>
      </SectionLabel>

      {confirming && (
        <div role="alertdialog" aria-label="Xác nhận xoá lịch sử" className="mt-3 border-l-2 border-accent bg-bg py-2 pr-2 pl-3">
          <p className="text-[12px] leading-snug">
            Xoá toàn bộ lịch sử trước hôm nay?{' '}
            <span className="text-muted">Streak của mọi thói quen sẽ về 0. Không hoàn tác được.</span>
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              variant="primary"
              className="h-7 px-2.5 text-[12px]"
              onClick={() => {
                onReset()
                setConfirming(false)
              }}
            >
              Xoá lịch sử
            </Button>
            <Button className="h-7 px-2.5 text-[12px]" onClick={() => setConfirming(false)}>
              Huỷ
            </Button>
          </div>
        </div>
      )}

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
