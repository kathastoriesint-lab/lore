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

/** UI tick — a single soft blip for advancing (intro cards, coach tips, light confirms). */
export function uiTick() {
  if (!enabled) return
  blip(620, 0.06, 'sine', 0.05, 0)
}

/** Cross into a world — a warm, rounded rising arpeggio; immersive, not celebratory
 *  (the squad-verdict `selected` is the triumphant one). Used on the intro's enter CTA. */
export function enterWorld() {
  if (!enabled) return
  blip(330, 0.22, 'sine', 0.07, 0)     // E4 — low, grounding
  blip(494, 0.30, 'sine', 0.06, 0.12)  // B4
  blip(659, 0.52, 'sine', 0.05, 0.26)  // E5 — the lift, lingering warm
}

/** Choice / confirm — a warm, soft two-note settle. Committing an A/B choice,
 *  confirming a name/avatar, a login landing. Gentler than postDone. */
export function confirm() {
  if (!enabled) return
  blip(440, 0.09, 'sine', 0.055, 0)     // A4
  blip(587, 0.13, 'sine', 0.05, 0.05)   // D5 — a small settle up
}

/** DM sent (outbound) — a light, quick upward tick. Deliberately quieter and
 *  brighter than dmLand (inbound) so sending and receiving feel different. */
export function messageSent() {
  if (!enabled) return
  blip(700, 0.05, 'triangle', 0.04, 0)
  blip(960, 0.07, 'sine', 0.035, 0.03)
}

/** Meter / goal gain — a short rising blip for a positive stat bump on the
 *  result sheet or a bond milestone. Smaller sibling of `selected`. */
export function meterUp() {
  if (!enabled) return
  blip(523, 0.07, 'triangle', 0.05, 0)     // C5
  blip(659, 0.09, 'triangle', 0.05, 0.05)  // E5
  blip(784, 0.13, 'sine', 0.045, 0.11)     // G5 — the lift
}

/** Heart/like — a tiny bright pop. For feed likes + reaction taps. */
export function like() {
  if (!enabled) return
  blip(880, 0.07, 'triangle', 0.06, 0)
  blip(1245, 0.10, 'sine', 0.05, 0.04)
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
