import { useState } from 'react'
import { CalendarClock, Flag, Hash, ListTodo, Plus } from 'lucide-react'
import { SectionLabel, IconButton } from './ui.jsx'

const VIEWS = [
  { id: 'all', label: 'Tất cả', icon: ListTodo },
  { id: 'today', label: 'Hôm nay', icon: CalendarClock },
  { id: 'p1', label: 'Ưu tiên cao', icon: Flag },
]

function NavItem({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`group relative flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-left text-[13px] transition-colors duration-150 ${
        active ? 'bg-hover font-medium text-fg' : 'text-muted hover:bg-hover hover:text-fg'
      }`}
    >
      {active && <span className="absolute top-2 bottom-2 -left-3 w-[2px] bg-accent" aria-hidden />}
      <Icon size={15} strokeWidth={1.5} className={active ? 'text-fg' : 'text-subtle group-hover:text-muted'} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="num text-[11px] text-subtle">{count}</span>
    </button>
  )
}

export default function Sidebar({ selection, onSelect, counts, tags, onAddTag }) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  const submitTag = (e) => {
    e.preventDefault()
    const name = draft.replace(/^#/, '').replace(/\s+/g, '').trim()
    if (name) onAddTag(name)
    setDraft('')
    setAdding(false)
  }

  return (
    <nav className="flex h-full flex-col gap-6 px-3 py-4" aria-label="Bộ lọc">
      <div className="flex flex-col gap-0.5">
        {VIEWS.map((v) => (
          <NavItem
            key={v.id}
            icon={v.icon}
            label={v.label}
            count={counts.views[v.id]}
            active={selection.type === 'view' && selection.value === v.id}
            onClick={() => onSelect({ type: 'view', value: v.id })}
          />
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <div className="px-2">
          <SectionLabel
            right={
              <IconButton label="Thêm tag" onClick={() => setAdding((a) => !a)} className="-mr-1.5 h-6 w-6">
                <Plus size={14} strokeWidth={1.5} />
              </IconButton>
            }
          >
            Tags
          </SectionLabel>
        </div>
        {adding && (
          <form onSubmit={submitTag} className="px-1 pb-1">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => !draft && setAdding(false)}
              onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
              placeholder="TênTag"
              className="field w-full font-mono"
            />
          </form>
        )}
        <div className="flex flex-col gap-0.5">
          {tags.map((t) => (
            <NavItem
              key={t}
              icon={Hash}
              label={t}
              count={counts.tags[t] || 0}
              active={selection.type === 'tag' && selection.value === t}
              onClick={() => onSelect({ type: 'tag', value: t })}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto hidden px-2 text-[12px] text-subtle lg:block">
        <p className="flex items-center justify-between py-1">
          Thêm task <kbd className="num rounded border border-line px-1.5 text-[11px]">N</kbd>
        </p>
        <p className="flex items-center justify-between py-1">
          Tìm kiếm <kbd className="num rounded border border-line px-1.5 text-[11px]">/</kbd>
        </p>
      </div>
    </nav>
  )
}
