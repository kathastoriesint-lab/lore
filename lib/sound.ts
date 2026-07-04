// UI sound cues — tiny tones synthesized with the Web Audio API (no asset files).
// Works on Android web + inside the Android WebView + desktop web. Browsers block
// audio until a user gesture, so call prime() from an early tap (we do it on the
// story tap + on making a choice) to warm the AudioContext before a timer-fired
// cue (like a DM landing) needs to play.
let ctx: AudioContext | null = null

// User preference, persisted so it survives reloads. Default ON.
const LS_KEY = 'weev_sound'
function loadPref(): boolean {
  try { if (typeof localStorage !== 'undefined') { const v = localStorage.getItem(LS_KEY); if (v !== null) return v === '1' } } catch { /* private mode */ }
  return true
}
let enabled = loadPref()
export function setSoundEnabled(on: boolean) {
  enabled = on
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(LS_KEY, on ? '1' : '0') } catch { /* private mode */ }
}
export function isSoundEnabled(): boolean { return enabled }

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    if (!ctx) ctx = new AC()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    return ctx
  } catch { return null }
}

/** Create/resume the AudioContext under a user gesture so later cues can play. */
export function prime() { ac() }

// A short tone with a fast attack + exponential decay (a soft "blip").
function blip(freq: number, dur: number, type: OscillatorType, gain: number, delay: number) {
  const c = ac()
  if (!c) return
  const t = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

/** DM received — a soft two-note "pop", like a message landing. */
export function dmLand() {
  if (!enabled) return
  blip(660, 0.12, 'sine', 0.08, 0)
  blip(880, 0.14, 'sine', 0.07, 0.06)
}

/** Post published — a brighter three-note rise that feels like sending. */
export function postDone() {
  if (!enabled) return
  blip(520, 0.10, 'triangle', 0.08, 0)
  blip(780, 0.12, 'triangle', 0.07, 0.05)
  blip(1040, 0.16, 'sine', 0.06, 0.11)
}

/** Squad verdict — SELECTED: a bright rising major triad, celebratory. */
export function selected() {
  if (!enabled) return
  blip(523, 0.13, 'triangle', 0.08, 0)     // C5
  blip(659, 0.14, 'triangle', 0.08, 0.10)  // E5
  blip(784, 0.16, 'triangle', 0.07, 0.20)  // G5
  blip(1047, 0.34, 'sine', 0.07, 0.32)     // C6 — the lift, lingering
}

/** Squad verdict — BENCHED: a low descending fall, the gut-punch. */
export function benched() {
  if (!enabled) return
  blip(294, 0.22, 'sine', 0.09, 0)     // D4
  blip(220, 0.28, 'sine', 0.09, 0.16)  // A3
  blip(147, 0.52, 'sine', 0.08, 0.34)  // D3 — low, lingering
}
