import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { SectionLabel, Button } from './ui.jsx'
import { ting, unlockAudio } from '../lib/sound.js'

const DURATION = { focus: 25 * 60, break: 5 * 60 }
const MODE_LABEL = { focus: 'Tập trung', break: 'Nghỉ' }
const KEY = 'mdt.pomodoro'

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

function loadTimer() {
  try {
    const t = JSON.parse(localStorage.getItem(KEY))
    if (t && DURATION[t.mode]) return t
  } catch {
    /* bỏ qua */
  }
  return { mode: 'focus', running: false, endAt: null, remaining: DURATION.focus }
}

export default function Pomodoro({ tasks, focusTaskId, onFocus, sessionsToday, onComplete }) {
  const [timer, setTimer] = useState(loadTimer)
  const [, force] = useState(0)
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  const remaining = timer.running ? Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000)) : timer.remaining
  const focusTask = tasks.find((t) => t.id === focusTaskId)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(timer))
    } catch {
      /* bỏ qua */
    }
  }, [timer])

  useEffect(() => {
    if (!timer.running) return
    const id = setInterval(() => {
      if (Date.now() >= timer.endAt) {
        ting()
        completeRef.current(timer.mode)
        const next = timer.mode === 'focus' ? 'break' : 'focus'
        setTimer({ mode: next, running: false, endAt: null, remaining: DURATION[next] })
      } else {
        force((n) => n + 1)
      }
    }, 250)
    return () => clearInterval(id)
  }, [timer])

  useEffect(() => {
    const base = 'must-do · workspace'
    document.title = timer.running ? `${fmt(remaining)} ${MODE_LABEL[timer.mode]} · must-do` : base
  }, [remaining, timer.running, timer.mode])

  const start = () => {
    unlockAudio()
    setTimer((t) => ({ ...t, running: true, endAt: Date.now() + t.remaining * 1000 }))
  }
  const pause = () => setTimer((t) => ({ ...t, running: false, endAt: null, remaining }))
  const reset = () => setTimer((t) => ({ mode: t.mode, running: false, endAt: null, remaining: DURATION[t.mode] }))
  const switchMode = (mode) => setTimer({ mode, running: false, endAt: null, remaining: DURATION[mode] })

  const elapsed = 1 - remaining / DURATION[timer.mode]

  return (
    <section aria-labelledby="pomo-h" className="px-4 py-4">
      <SectionLabel
        right={
          <span className="num text-[11px] text-subtle" title="Số phiên tập trung đã xong hôm nay">
            {sessionsToday} phiên hôm nay
          </span>
        }
      >
        <span id="pomo-h">Pomodoro</span>
      </SectionLabel>

      <div role="radiogroup" aria-label="Chế độ" className="mt-3 grid grid-cols-2 rounded border border-line text-[12px]">
        {['focus', 'break'].map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={timer.mode === m}
            onClick={() => switchMode(m)}
            className={`flex h-7 items-center justify-center gap-1.5 border-l border-line first:border-l-0 transition-colors duration-150 ${
              timer.mode === m ? 'bg-hover text-fg' : 'text-subtle hover:text-fg'
            }`}
          >
            {MODE_LABEL[m]} <span className="num text-[11px] text-subtle">{fmt(DURATION[m])}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <output
          aria-live="off"
          className={`num block text-[64px] leading-none font-medium tracking-[-0.04em] ${timer.running ? 'text-fg' : 'text-muted'}`}
        >
          {fmt(remaining)}
        </output>
        <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] text-subtle">
          <span
            className={`h-1.5 w-1.5 rounded-full ${timer.running ? (timer.mode === 'focus' ? 'bg-accent' : 'bg-done') : 'bg-line-strong'}`}
          />
          {timer.running ? 'đang chạy' : remaining === DURATION[timer.mode] ? 'sẵn sàng' : 'tạm dừng'}
        </span>
      </div>

      <div className="mt-3 h-[2px] w-full bg-line" aria-hidden>
        <div
          className={`h-full ${timer.mode === 'focus' ? 'bg-accent' : 'bg-done'}`}
          style={{ width: `${elapsed * 100}%` }}
        />
      </div>

      <label className="mt-4 block">
        <span className="text-[12px] text-muted">Đang tập trung vào</span>
        <select
          value={focusTask ? focusTaskId : ''}
          onChange={(e) => onFocus(e.target.value || null)}
          className="field mt-1 w-full truncate"
        >
          <option value="">Chưa chọn task</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.priority} · {t.title}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3 flex gap-2">
        {timer.running ? (
          <Button variant="primary" onClick={pause} className="flex-1">
            <Pause size={14} strokeWidth={2} /> Tạm dừng
          </Button>
        ) : (
          <Button variant="primary" onClick={start} className="flex-1">
            <Play size={14} strokeWidth={2} /> Bắt đầu
          </Button>
        )}
        <Button onClick={reset} aria-label="Đặt lại">
          <RotateCcw size={14} strokeWidth={1.5} /> Đặt lại
        </Button>
      </div>
    </section>
  )
}
