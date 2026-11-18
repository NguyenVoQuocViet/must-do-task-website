import { toKey } from './date.js'

/*
 * Sao lưu vào một thư mục cố định bằng File System Access API (Chrome/Edge).
 * Handle thư mục được lưu trong IndexedDB để lần sau ghi thẳng, không hỏi lại.
 * Trình duyệt không hỗ trợ → tải file về như bình thường.
 */

const DB_NAME = 'mdt-fs'
const STORE = 'handles'
const DIR_KEY = 'exportDir'
const LAST_KEY = 'mdt.lastExport'
const SNOOZE_KEY = 'mdt.exportSnooze'

const pad = (n) => String(n).padStart(2, '0')

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idb(mode, fn) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export const supportsFolder = () => typeof window !== 'undefined' && 'showDirectoryPicker' in window

export async function getFolder() {
  if (!supportsFolder()) return null
  try {
    return (await idb('readonly', (s) => s.get(DIR_KEY))) || null
  } catch {
    return null
  }
}

/** Mở hộp thoại chọn thư mục; ném AbortError nếu người dùng huỷ */
export async function pickFolder() {
  const dir = await window.showDirectoryPicker({ id: 'mdt-exports', mode: 'readwrite' })
  await idb('readwrite', (s) => s.put(dir, DIR_KEY))
  return dir
}

async function ensurePermission(dir) {
  const opts = { mode: 'readwrite' }
  if ((await dir.queryPermission(opts)) === 'granted') return true
  return (await dir.requestPermission(opts)) === 'granted'
}

/** must-do-task_2026-11-18_1430.json — có giờ phút để export nhiều lần trong ngày không bị ghi đè */
export function backupFilename(d = new Date()) {
  return `must-do-task_${toKey(d)}_${pad(d.getHours())}${pad(d.getMinutes())}.json`
}

function download(json, name) {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

/** Trả về { mode: 'folder' | 'download', name, folder? } */
export async function writeBackup(json) {
  const name = backupFilename()
  if (!supportsFolder()) {
    download(json, name)
    return { mode: 'download', name }
  }
  let dir = await getFolder()
  if (!dir) dir = await pickFolder()
  if (!(await ensurePermission(dir))) throw new Error('Chưa cấp quyền ghi vào thư mục sao lưu.')
  const file = await dir.getFileHandle(name, { create: true })
  const w = await file.createWritable()
  await w.write(json)
  await w.close()
  return { mode: 'folder', name, folder: dir.name }
}

/* ---------- mốc sao lưu & nhắc nhở ---------- */

export function getLastExport() {
  try {
    return localStorage.getItem(LAST_KEY)
  } catch {
    return null
  }
}

export function markExported() {
  const iso = new Date().toISOString()
  try {
    localStorage.setItem(LAST_KEY, iso)
  } catch {
    /* bỏ qua */
  }
  return iso
}

export function getSnooze() {
  try {
    return localStorage.getItem(SNOOZE_KEY)
  } catch {
    return null
  }
}

export function setSnooze(dayKey) {
  try {
    localStorage.setItem(SNOOZE_KEY, dayKey)
  } catch {
    /* bỏ qua */
  }
}
