const pad = (n) => String(n).padStart(2, '0')

export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const todayKey = () => toKey(new Date())

export const parseKey = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (key, n) => {
  const d = parseKey(key)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

export const diffDays = (a, b) => Math.round((parseKey(a) - parseKey(b)) / 86400000)

export const shortDate = (key) => {
  const d = parseKey(key)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
export const longToday = (key) => {
  const d = parseKey(key)
  return `${WEEKDAYS[d.getDay()]} ${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

/** Nhãn deadline + mức độ: 'overdue' | 'today' | 'soon' | 'later' */
export const deadlineInfo = (key, today) => {
  if (!key) return null
  const d = diffDays(key, today)
  if (d < 0) return { label: `Trễ ${-d} ngày`, tone: 'overdue' }
  if (d === 0) return { label: 'Hôm nay', tone: 'today' }
  if (d === 1) return { label: 'Ngày mai', tone: 'soon' }
  return { label: shortDate(key), tone: 'later' }
}
