import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, FolderOpen, Moon, Sun, Upload } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import Habits from './components/Habits.jsx'
import Tasks from './components/Tasks.jsx'
import Pomodoro from './components/Pomodoro.jsx'
import Heatmap from './components/Heatmap.jsx'
import Scratchpad from './components/Scratchpad.jsx'
import { Button } from './components/ui.jsx'
import { load, save, normalize, validate, uid, PRIORITY_ORDER } from './lib/store.js'
import { diffDays, longToday, todayKey, toKey } from './lib/date.js'
import {
  getFolder,
  getLastExport,
  getSnooze,
  markExported,
  pickFolder,
  setSnooze,
  supportsFolder,
  writeBackup,
} from './lib/backup.js'

const VIEW_HEADINGS = { all: 'Tất cả task', today: 'Hôm nay', p1: 'Ưu tiên cao' }
const REMIND_AFTER_DAYS = 3

function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    root.classList.add('theme-anim')
    root.dataset.theme = next
    setTimeout(() => root.classList.remove('theme-anim'), 220)
    try {
      localStorage.setItem('mdt.theme', next)
    } catch {
      /* bỏ qua */
    }
    setTheme(next)
  }
  return [theme, toggle]
}

export default function App() {
  const [data, setData] = useState(load)
  const [today, setToday] = useState(todayKey)
  const [selection, setSelection] = useState({ type: 'view', value: 'all' })
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState(null)
  const [theme, toggleTheme] = useTheme()
  const [lastExport, setLastExport] = useState(getLastExport)
  const [snooze, setSnoozeState] = useState(getSnooze)
  const [folderName, setFolderName] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    getFolder().then((dir) => dir && setFolderName(dir.name))
  }, [])
  const addRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => save(data), [data])

  // Sang ngày mới (qua 00:00): trạng thái check của habit tự về "chưa làm"
  // vì được tính từ habitLog[today]; lịch sử cũ vẫn giữ cho heatmap/streak.
  useEffect(() => {
    const check = () => setToday((prev) => (prev === todayKey() ? prev : todayKey()))
    const id = setInterval(check, 30_000)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])
  useEffect(() => {
    setData((d) => (d.lastDate === today ? d : { ...d, lastDate: today }))
  }, [today])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3500)
    return () => clearTimeout(t)
  }, [notice])

  // Phím tắt: N = thêm task, / = tìm kiếm
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        addRef.current?.focus()
      } else if (e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ---------- actions ---------- */
  const toggleHabit = (id) =>
    setData((d) => {
      const list = d.habitLog[today] || []
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
      return { ...d, habitLog: { ...d.habitLog, [today]: next } }
    })
  const addHabit = (title) => setData((d) => ({ ...d, habits: [...d.habits, { id: uid(), title, createdAt: today }] }))
  const deleteHabit = (id) => setData((d) => ({ ...d, habits: d.habits.filter((h) => h.id !== id) }))

  const addTask = (t) =>
    setData((d) => ({
      ...d,
      tasks: [{ id: uid(), done: false, doneAt: null, createdAt: today, ...t }, ...d.tasks],
    }))
  const toggleTask = (id) =>
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, done: !t.done, doneAt: t.done ? null : today } : t)),
      focusTaskId: d.focusTaskId === id ? null : d.focusTaskId,
    }))
  const updateTask = (id, patch) =>
    setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
  const deleteTask = (id) =>
    setData((d) => ({
      ...d,
      tasks: d.tasks.filter((t) => t.id !== id),
      focusTaskId: d.focusTaskId === id ? null : d.focusTaskId,
    }))
  const setFocus = (id) => setData((d) => ({ ...d, focusTaskId: id }))
  const addTag = (name) => setData((d) => (d.tags.includes(name) ? d : { ...d, tags: [...d.tags, name] }))
  const setScratch = useCallback((scratch) => setData((d) => ({ ...d, scratch })), [])
  const onPomodoroComplete = useCallback(
    (mode) => {
      if (mode !== 'focus') return
      setData((d) => ({ ...d, pomodoros: { ...d.pomodoros, [today]: (d.pomodoros[today] || 0) + 1 } }))
    },
    [today],
  )

  /* ---------- export / import ---------- */
  const exportJSON = async () => {
    const json = JSON.stringify({ app: 'must-do-task', exportedAt: new Date().toISOString(), ...data }, null, 2)
    try {
      const res = await writeBackup(json)
      if (res.folder) setFolderName(res.folder)
      setLastExport(markExported())
      setNotice({
        tone: 'ok',
        text: res.mode === 'folder' ? `Đã lưu ${res.name} vào thư mục "${res.folder}".` : `Đã tải về ${res.name}.`,
      })
    } catch (err) {
      if (err?.name === 'AbortError') return setNotice({ tone: 'error', text: 'Chưa export: bạn đã huỷ chọn thư mục.' })
      setNotice({ tone: 'error', text: `Không export được: ${err?.message || 'lỗi ghi file'}` })
    }
  }

  const changeFolder = async () => {
    try {
      const dir = await pickFolder()
      setFolderName(dir.name)
      setNotice({ tone: 'ok', text: `Lần export sau sẽ lưu vào thư mục "${dir.name}".` })
    } catch (err) {
      if (err?.name !== 'AbortError') setNotice({ tone: 'error', text: 'Không chọn được thư mục này. Hãy chọn thư mục khác.' })
    }
  }

  const snoozeReminder = () => {
    setSnooze(today)
    setSnoozeState(today)
  }

  const daysSinceExport = lastExport ? diffDays(today, toKey(new Date(lastExport))) : null
  const backupOverdue = daysSinceExport === null || daysSinceExport >= REMIND_AFTER_DAYS
  const showReminder = backupOverdue && snooze !== today
  const backupLabel =
    daysSinceExport === null
      ? 'Chưa sao lưu'
      : daysSinceExport === 0
        ? 'Sao lưu: hôm nay'
        : daysSinceExport === 1
          ? 'Sao lưu: hôm qua'
          : `Sao lưu: ${daysSinceExport} ngày trước`

  const importJSON = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      const err = validate(parsed)
      if (err) return setNotice({ tone: 'error', text: `Không nhập được: ${err}` })
      setData(normalize(parsed))
      setSelection({ type: 'view', value: 'all' })
      setNotice({ tone: 'ok', text: `Đã nhập ${parsed.tasks.length} task, ${parsed.habits.length} thói quen.` })
    } catch {
      setNotice({ tone: 'error', text: 'Không nhập được: file không phải JSON hợp lệ.' })
    }
  }

  /* ---------- derived ---------- */
  const isTodayTask = (t) => (!t.done && t.deadline && t.deadline <= today) || t.doneAt === today

  const counts = useMemo(() => {
    const open = data.tasks.filter((t) => !t.done)
    const tags = {}
    open.forEach((t) => (tags[t.tag] = (tags[t.tag] || 0) + 1))
    return {
      views: {
        all: open.length,
        today: open.filter((t) => t.deadline && t.deadline <= today).length,
        p1: open.filter((t) => t.priority === 'P1').length,
      },
      tags,
    }
  }, [data.tasks, today])

  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return data.tasks
      .filter((t) => {
        if (selection.type === 'tag') return t.tag === selection.value
        if (selection.value === 'today') return isTodayTask(t)
        if (selection.value === 'p1') return t.priority === 'P1'
        return true
      })
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
          (a.deadline || '9999').localeCompare(b.deadline || '9999'),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.tasks, selection, search, today])

  const progress = useMemo(() => {
    const todays = data.tasks.filter(isTodayTask)
    const habitsDone = data.habits.filter((h) => (data.habitLog[today] || []).includes(h.id)).length
    return {
      done: todays.filter((t) => t.done).length + habitsDone,
      total: todays.length + data.habits.length,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.tasks, data.habits, data.habitLog, today])

  const heading = selection.type === 'tag' ? `#${selection.value}` : VIEW_HEADINGS[selection.value]
  const defaults = {
    tag: selection.type === 'tag' ? selection.value : data.tags[0],
    deadline: selection.type === 'view' && selection.value === 'today' ? today : null,
  }
  const openTasks = useMemo(
    () => data.tasks.filter((t) => !t.done).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    [data.tasks],
  )

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg lg:h-screen">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line px-4">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-accent" aria-hidden />
          <span className="font-mono text-[13px] font-medium tracking-[-0.01em]">must-do</span>
        </span>
        <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
        <span className="num hidden text-[12px] text-muted sm:block">{longToday(today)}</span>

        <div className="ml-auto flex items-center gap-2">
          {notice && (
            <span
              role="status"
              className={`hidden max-w-xs truncate text-[12px] md:block ${notice.tone === 'error' ? 'text-accent' : 'text-muted'}`}
            >
              {notice.text}
            </span>
          )}
          {!notice && (
            <span
              className={`hidden items-center gap-1.5 font-mono text-[11px] lg:flex ${backupOverdue ? 'text-accent' : 'text-subtle'}`}
              title={lastExport ? `Lần export cuối: ${new Date(lastExport).toLocaleString('vi-VN')}` : 'Chưa export lần nào'}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${backupOverdue ? 'bg-accent' : 'bg-done'}`} aria-hidden />
              {backupLabel}
            </span>
          )}
          <Button
            onClick={exportJSON}
            className="h-7 px-2.5 text-[12px]"
            title={folderName ? `Lưu file JSON vào thư mục "${folderName}"` : 'Lưu file JSON sao lưu toàn bộ dữ liệu'}
          >
            <Download size={13} strokeWidth={1.5} />
            <span className="hidden sm:inline">Export JSON</span>
          </Button>
          {supportsFolder() && (
            <button
              type="button"
              onClick={changeFolder}
              aria-label={folderName ? `Đổi thư mục sao lưu (hiện tại: ${folderName})` : 'Chọn thư mục sao lưu'}
              title={folderName ? `Thư mục sao lưu: ${folderName} · bấm để đổi` : 'Chọn thư mục sao lưu'}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line-strong text-muted hover:bg-hover hover:text-fg"
            >
              <FolderOpen size={14} strokeWidth={1.5} />
            </button>
          )}
          <Button onClick={() => fileRef.current?.click()} className="h-7 px-2.5 text-[12px]" title="Khôi phục từ file JSON (ghi đè dữ liệu hiện tại)">
            <Upload size={13} strokeWidth={1.5} />
            <span className="hidden sm:inline">Import JSON</span>
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={importJSON} className="hidden" />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line-strong text-muted hover:bg-hover hover:text-fg"
          >
            {theme === 'dark' ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
          </button>
        </div>
      </header>
      {notice && (
        <p role="status" className={`border-b border-line px-4 py-2 text-[12px] md:hidden ${notice.tone === 'error' ? 'text-accent' : 'text-muted'}`}>
          {notice.text}
        </p>
      )}
      {showReminder && (
        <div role="note" className="relative flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-surface py-2 pr-4 pl-5">
          <span className="absolute top-0 bottom-0 left-0 w-[2px] bg-accent" aria-hidden />
          <p className="min-w-0 flex-1 text-[13px]">
            {daysSinceExport === null
              ? 'Bạn chưa sao lưu dữ liệu lần nào.'
              : `Lần sao lưu cuối cách đây ${daysSinceExport} ngày.`}{' '}
            <span className="text-muted">
              Dữ liệu chỉ nằm trong trình duyệt này, xoá dữ liệu duyệt web là mất.
              {supportsFolder() && !folderName && ' Lần đầu export, hãy chọn thư mục exports trong dự án.'}
            </span>
          </p>
          <div className="flex gap-2">
            <Button variant="primary" onClick={exportJSON} className="h-7 px-2.5 text-[12px]">
              <Download size={13} strokeWidth={2} /> Export ngay
            </Button>
            <Button onClick={snoozeReminder} className="h-7 px-2.5 text-[12px]">
              Nhắc lại ngày mai
            </Button>
          </div>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[232px_minmax(0,1fr)_340px]">
        <aside className="border-b border-line lg:overflow-y-auto lg:border-r lg:border-b-0">
          <Sidebar selection={selection} onSelect={setSelection} counts={counts} tags={data.tags} onAddTag={addTag} />
        </aside>

        <main className="min-w-0 lg:overflow-y-auto">
          <div className="mx-auto flex max-w-[860px] flex-col gap-10 px-4 py-6 sm:px-8">
            <Habits
              habits={data.habits}
              habitLog={data.habitLog}
              today={today}
              onToggle={toggleHabit}
              onAdd={addHabit}
              onDelete={deleteHabit}
            />
            <Tasks
              tasks={visibleTasks}
              tags={data.tags}
              today={today}
              heading={heading}
              search={search}
              onSearch={setSearch}
              progress={progress}
              defaults={defaults}
              focusTaskId={data.focusTaskId}
              onAdd={addTask}
              onToggle={toggleTask}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onFocus={setFocus}
              addRef={addRef}
              searchRef={searchRef}
            />
          </div>
        </main>

        <aside className="flex flex-col divide-y divide-line border-t border-line lg:overflow-y-auto lg:border-t-0 lg:border-l">
          <Pomodoro
            tasks={openTasks}
            focusTaskId={data.focusTaskId}
            onFocus={setFocus}
            sessionsToday={data.pomodoros[today] || 0}
            onComplete={onPomodoroComplete}
          />
          <Heatmap habitLog={data.habitLog} tasks={data.tasks} today={today} />
          <Scratchpad value={data.scratch} onChange={setScratch} />
        </aside>
      </div>
    </div>
  )
}
