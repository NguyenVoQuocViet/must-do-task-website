let ctx = null

/** Gọi trong một thao tác người dùng (click Start) để trình duyệt cho phép phát âm thanh */
export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
}

/** Tiếng "ting" hai nốt nhẹ, tổng hợp bằng Web Audio API */
export function ting() {
  unlockAudio()
  if (!ctx) return
  const t = ctx.currentTime
  ;[
    [1318.5, 0],
    [1975.5, 0.14],
  ].forEach(([freq, offset]) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, t + offset)
    gain.gain.exponentialRampToValueAtTime(0.22, t + offset + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 1.1)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t + offset)
    osc.stop(t + offset + 1.2)
  })
}
