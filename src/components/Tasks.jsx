import { useEffect, useState } from 'react'
import { ChevronRight, Crosshair, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { SectionLabel, IconButton, Button, Checkbox } from './ui.jsx'
import { deadlineInfo } from '../lib/date.js'

const PRIORITIES = ['P1', 'P2', 'P3']
const PRIORITY_TONE = { P1: 'text-accent', P2: 'text-fg', P3: 'text-subtle' }
const DEADLINE_TONE = { overdue: 'text-accent', today: 'text-fg', soon: 'text-muted', later: 'text-subtle' }

function PrioritySelect({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Độ ưu tiên" className="flex h-8 shrink-0 overflow-hidden rounded border border-line">
      {PRIORITIES.map((p) => (
        <button
          key={p}
          type="button"
          role="radio"
          aria-checked={value === p}
          onClick={() => onChange(p)}
          className={`num w-9 border-l border-line text-[12px] first:border-l-0 transition-colors duration-150 ${
            value === p ? 'bg-hover font-medium ' + PRIORITY_TONE[p] : 'text-subtle hover:text-fg'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

function TaskFields({ draft, setDraft, tags, inputRef, placeholder }) {
  return (
    <>
      <input
        ref={inputRef}
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder={placeholder}
        aria-label="Tiêu đề task"
        className="field h-8 min-w-0 flex-1 basis-full sm:basis-0"
      />
      <select
        value={draft.tag}
        onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
        aria-label="Tag"
        className="field num pr-1 text-[12px]"
      >
        {tags.map((t) => (
          <option key={t} value={t}>
            #{t}
          </option>
        ))}
      </select>
      <PrioritySelect value={draft.priority} onChange={(priority) => setDraft({ ...draft, priority })} />
      <input
        type="date"
        value={draft.deadline || ''}
        onChange={(e) => setDraft({ ...draft, deadline: e.target.value || null })}
        aria-label="Deadline"
        className="field num w-[132px] text-[12px]"
      />
    </>
  )
}

function TaskRow({ task, tags, today, focused, onToggle, onUpdate, onDelete, onFocus }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const dl = deadlineInfo(task.deadline, today)

  useEffect(() => {
    if (!confirmDelete) return
    const t = setTimeout(() => setConfirmDelete(false), 2500)
    return () => clearTimeout(t)
  }, [confirmDelete])

  if (editing) {
    const save = (e) => {
      e.preventDefault()
      if (!draft.title.trim()) return
      onUpdate(task.id, { title: draft.title.trim(), tag: draft.tag, priority: draft.priority, deadline: draft.deadline })
      setEditing(false)
    }
    return (
      <li className="py-2">
        <form
          onSubmit={save}
          onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
          className="flex flex-wrap items-center gap-2"
        >
          <TaskFields draft={draft} setDraft={setDraft} tags={tags} placeholder="Tiêu đề task" />
          <Button type="submit" variant="primary">
            Lưu
          </Button>
          <Button onClick={() => setEditing(false)}>Huỷ</Button>
        </form>
      </li>
    )
  }

  return (
    <li className="group flex min-h-11 items-center gap-3 py-2">
      <Checkbox shape="circle" checked={task.done} onChange={() => onToggle(task.id)} label={`Hoàn thành: ${task.title}`} />
      <span className={`num w-6 shrink-0 text-[11px] font-medium ${task.done ? 'text-subtle' : PRIORITY_TONE[task.priority]}`}>
        {task.priority}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`text-[14px] leading-snug ${task.done ? 'text-muted line-through decoration-line-strong' : ''}`}
          onDoubleClick={() => !task.done && (setDraft(task), setEditing(true))}
        >
          {focused && <span className="mr-2 inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-accent align-middle" title="Đang tập trung" />}
          {task.title}
        </p>
        <p className="mt-0.5 flex gap-3 font-mono text-[11px] text-subtle sm:hidden">
          <span>#{task.tag}</span>
          {dl && <span className={task.done ? '' : DEADLINE_TONE[dl.tone]}>{dl.label}</span>}
        </p>
      </div>
      <span className="hidden w-24 shrink-0 truncate font-mono text-[11px] text-subtle sm:block">#{task.tag}</span>
      <span
        className={`num hidden w-20 shrink-0 text-right text-[11px] sm:block ${dl && !task.done ? DEADLINE_TONE[dl.tone] : 'text-subtle'}`}
      >
        {dl ? dl.label : '—'}
      </span>
      <div className="flex shrink-0 items-center opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        {!task.done && (
          <IconButton label="Tập trung vào task này" onClick={() => onFocus(task.id)} active={focused}>
            <Crosshair size={14} strokeWidth={1.5} />
          </IconButton>
        )}
        <IconButton
          label="Sửa task"
          onClick={() => {
            setDraft(task)
            setEditing(true)
          }}
        >
          <Pencil size={14} strokeWidth={1.5} />
        </IconButton>
        <IconButton
          label={confirmDelete ? 'Bấm lần nữa để xoá' : 'Xoá task'}
          onClick={() => (confirmDelete ? onDelete(task.id) : setConfirmDelete(true))}
          className={confirmDelete ? 'w-auto px-2 text-accent hover:text-accent' : ''}
        >
          {confirmDelete ? <span className="text-[12px] font-medium">Xoá?</span> : <Trash2 size={14} strokeWidth={1.5} />}
        </IconButton>
      </div>
    </li>
  )
}

export default function Tasks({
  tasks,
  tags,
  today,
  heading,
  search,
  onSearch,
  progress,
  defaults,
  focusTaskId,
  onAdd,
  onToggle,
  onUpdate,
  onDelete,
  onFocus,
  addRef,
  searchRef,
}) {
  const empty = { title: '', tag: defaults.tag, priority: 'P2', deadline: defaults.deadline }
  const [draft, setDraft] = useState(empty)
  const [showDone, setShowDone] = useState(true)

  useEffect(() => {
    setDraft((d) => ({ ...d, tag: defaults.tag, deadline: defaults.deadline }))
  }, [defaults.tag, defaults.deadline])

  const submit = (e) => {
    e.preventDefault()
    if (!draft.title.trim()) return
    onAdd({ ...draft, title: draft.title.trim() })
    setDraft({ ...empty, tag: draft.tag, priority: draft.priority, deadline: draft.deadline })
  }

  const open = tasks.filter((t) => !t.done)
  const done = tasks.filter((t) => t.done)
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0
  const rowProps = { tags, today, onToggle, onUpdate, onDelete, onFocus }

  return (
    <section aria-labelledby="tasks-h" className="flex flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <SectionLabel>Việc cần làm</SectionLabel>
          <h1 id="tasks-h" className="mt-1 text-[20px] font-semibold tracking-[-0.015em]">
            {heading}
          </h1>
        </div>
        <label className="relative flex w-full items-center sm:w-64">
          <Search size={14} strokeWidth={1.5} className="pointer-events-none absolute left-2.5 text-subtle" />
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && (onSearch(''), e.currentTarget.blur())}
            placeholder="Tìm task…"
            aria-label="Tìm task"
            className="field w-full pl-8"
          />
          {search && (
            <button
              type="button"
              aria-label="Xoá tìm kiếm"
              onClick={() => onSearch('')}
              className="absolute right-2 text-subtle hover:text-fg"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          )}
        </label>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="text-muted">Tiến độ hôm nay</span>
          <span className="num text-muted">
            <span className="text-fg">{progress.done}</span>/{progress.total} · {pct}%
          </span>
        </div>
        <div
          className="mt-1.5 h-[3px] w-full overflow-hidden bg-line"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tiến độ hôm nay"
        >
          <div
            className={`h-full transition-[width] duration-200 ease-out ${pct === 100 ? 'bg-done' : 'bg-accent'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 flex flex-wrap items-center gap-2 rounded-md border border-line bg-surface p-2">
        <TaskFields draft={draft} setDraft={setDraft} tags={tags} inputRef={addRef} placeholder="Thêm task mới…" />
        <Button type="submit" variant="primary" disabled={!draft.title.trim()}>
          <Plus size={14} strokeWidth={2} />
          Thêm
        </Button>
      </form>

      <ul className="mt-3 divide-y divide-line border-b border-line">
        {open.map((t) => (
          <TaskRow key={t.id} task={t} focused={t.id === focusTaskId} {...rowProps} />
        ))}
        {!open.length && (
          <li className="py-6 text-[13px] text-muted">
            {search ? `Không có task nào khớp "${search}".` : 'Không còn việc nào ở đây. Thêm task mới ở ô phía trên.'}
          </li>
        )}
      </ul>

      {done.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowDone((s) => !s)}
            aria-expanded={showDone}
            className="flex items-center gap-1.5 text-[12px] text-muted hover:text-fg"
          >
            <ChevronRight size={14} strokeWidth={1.5} className={`transition-transform duration-150 ${showDone ? 'rotate-90' : ''}`} />
            Đã xong <span className="num">{done.length}</span>
          </button>
          {showDone && (
            <ul className="mt-1 divide-y divide-line border-b border-line">
              {done.map((t) => (
                <TaskRow key={t.id} task={t} focused={false} {...rowProps} />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
