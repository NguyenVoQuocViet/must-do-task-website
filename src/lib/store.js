import { addDays, todayKey } from './date.js'

export const STORAGE_KEY = 'mdt.workspace.v1'
export const DEFAULT_TAGS = ['PTUDWeb', 'LeetCode', 'ĐồÁn', 'CáNhân']

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

/* Pseudo-random xác định để lịch sử mẫu ổn định giữa các lần nạp */
const rand = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

export function createSeed() {
  const today = todayKey()
  const habits = [
    { id: 'h-leetcode', title: 'Giải 1 bài LeetCode (Daily Challenge)', streak: 5 },
    { id: 'h-commit', title: 'Push ít nhất 1 commit lên GitHub', streak: 12 },
    { id: 'h-english', title: 'Đọc tài liệu tiếng Anh 15 phút', streak: 3 },
  ]

  // Lịch sử 12 tuần: chuỗi liên tiếp kết thúc hôm qua, ngày trước chuỗi bị bỏ lỡ,
  // phần còn lại ngẫu nhiên để heatmap có dữ liệu.
  const habitLog = {}
  habits.forEach((h, hi) => {
    for (let ago = 1; ago <= 90; ago++) {
      let done
      if (ago <= h.streak) done = true
      else if (ago === h.streak + 1) done = false
      else done = rand(ago * 7 + hi * 131) < 0.55
      if (done) {
        const key = addDays(today, -ago)
        ;(habitLog[key] ||= []).push(h.id)
      }
    }
  })

  const tasks = [
    {
      title: 'Hoàn thành giao diện trang chủ & responsive bài tập lớn PTUDWeb',
      tag: 'PTUDWeb',
      priority: 'P1',
      deadline: today,
    },
    {
      title: 'Làm LeetCode #1 - Two Sum & #20 - Valid Parentheses',
      tag: 'LeetCode',
      priority: 'P2',
      deadline: today,
    },
    {
      title: 'Thiết kế ERD cơ sở dữ liệu cho đồ án cuối kỳ',
      tag: 'ĐồÁn',
      priority: 'P1',
      deadline: addDays(today, 1),
    },
    { title: 'Ôn tập lại Flexbox và CSS Grid', tag: 'PTUDWeb', priority: 'P3', deadline: null },
  ].map((t) => ({ id: uid(), done: false, doneAt: null, createdAt: today, ...t }))

  return {
    version: 1,
    habits: habits.map(({ id, title }) => ({ id, title, createdAt: addDays(today, -90) })),
    habitLog,
    tasks,
    tags: [...DEFAULT_TAGS],
    pomodoros: {},
    focusTaskId: null,
    scratch:
      '# PTUDWeb\nhttps://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout\n\n# Lệnh hay quên\ngit commit --amend --no-edit\nnpx kill-port 5173\n\n# Ý tưởng\nValid Parentheses → stack, đẩy ký tự mở, gặp ký tự đóng thì so khớp đỉnh.',
    lastDate: today,
  }
}

export function normalize(d) {
  return {
    version: 1,
    habits: Array.isArray(d.habits) ? d.habits : [],
    habitLog: d.habitLog && typeof d.habitLog === 'object' ? d.habitLog : {},
    tasks: Array.isArray(d.tasks) ? d.tasks : [],
    tags: Array.isArray(d.tags) && d.tags.length ? d.tags : [...DEFAULT_TAGS],
    pomodoros: d.pomodoros && typeof d.pomodoros === 'object' ? d.pomodoros : {},
    focusTaskId: d.focusTaskId ?? null,
    scratch: typeof d.scratch === 'string' ? d.scratch : '',
    lastDate: d.lastDate || todayKey(),
  }
}

/** Trả về thông báo lỗi nếu dữ liệu import không hợp lệ, ngược lại null */
export function validate(d) {
  if (!d || typeof d !== 'object') return 'File không chứa đối tượng JSON.'
  if (!Array.isArray(d.tasks)) return 'Thiếu mảng "tasks".'
  if (!Array.isArray(d.habits)) return 'Thiếu mảng "habits".'
  if (d.tasks.some((t) => !t || typeof t.title !== 'string' || !t.id)) return 'Có task thiếu "id" hoặc "title".'
  return null
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const d = JSON.parse(raw)
      if (!validate(d)) return normalize(d)
    }
  } catch {
    /* localStorage bị chặn hoặc hỏng → dùng dữ liệu mẫu */
  }
  return createSeed()
}

export function save(d) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
  } catch {
    /* bỏ qua */
  }
}

export function streakOf(habitLog, habitId, today) {
  const has = (k) => (habitLog[k] || []).includes(habitId)
  let day = has(today) ? today : addDays(today, -1)
  let n = 0
  while (has(day) && n < 3650) {
    n++
    day = addDays(day, -1)
  }
  return n
}

export const PRIORITY_ORDER = { P1: 0, P2: 1, P3: 2 }
