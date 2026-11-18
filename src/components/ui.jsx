import { Check } from 'lucide-react'

export function SectionLabel({ children, right }) {
  return (
    <div className="flex h-6 items-center justify-between gap-3">
      <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted">{children}</h2>
      {right}
    </div>
  )
}

export function IconButton({ label, onClick, children, className = '', active = false, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted transition-colors duration-150 hover:bg-hover hover:text-fg ${
        active ? 'text-accent' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Button({ variant = 'secondary', className = '', children, ...rest }) {
  const base =
    'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40'
  const styles =
    variant === 'primary'
      ? 'bg-accent text-accent-fg hover:brightness-110'
      : 'border border-line-strong text-fg hover:bg-hover'
  return (
    <button type="button" className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  )
}

/** shape: 'square' cho habit, 'circle' cho task */
export function Checkbox({ checked, onChange, label, shape = 'square' }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center border transition-colors duration-150 ${
        shape === 'circle' ? 'rounded-full' : 'rounded-[3px]'
      } ${checked ? 'border-done bg-done text-white' : 'border-line-strong hover:border-muted'}`}
    >
      {checked && <Check size={11} strokeWidth={3} />}
    </button>
  )
}
