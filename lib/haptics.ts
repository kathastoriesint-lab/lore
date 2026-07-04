// Haptics — one intent-based API, targeting Android + web (iOS not in scope):
//  • Android app (Capacitor): @capacitor/haptics → system vibrator. Using the
//    plugin (vs raw navigator.vibrate) also registers the VIBRATE permission and
//    is reliable inside the Android WebView.
//  • Android mobile-web: the web Vibration API (navigator.vibrate).
//  • Desktop web (and iOS, if ever added): silent no-op.
// Callsites use semantic verbs (tap / select / impact / success) and never touch
// the platform. Gated by a global toggle + prefers-reduced-motion.
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

// User preference, persisted so it survives reloads. Default ON.
const LS_KEY = 'weev_haptics'
function loadPref(): boolean {
  try { if (typeof localStorage !== 'undefined') { const v = localStorage.getItem(LS_KEY); if (v !== null) return v === '1' } } catch { /* private mode */ }
  return true
}
let enabled = loadPref()
export function setHapticsEnabled(on: boolean) {
  enabled = on
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(LS_KEY, on ? '1' : '0') } catch { /* private mode */ }
}
export function isHapticsEnabled(): boolean { return enabled }

function reducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
function live(): boolean {
  return enabled && typeof window !== 'undefined' && !reducedMotion()
}
function isNative(): boolean {
  try { return Capacitor.isNativePlatform() } catch { return false }
}
function webVibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(pattern)
  } catch { /* unsupported (iOS Safari, desktop) — silent */ }
}

/** Light tick — advancing the story, small confirms. */
export function tap() {
  if (!live()) return
  if (isNative()) Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
  else webVibrate(8)
}

/** Selection feedback — committing an A/B choice. Slightly firmer than a tap. */
export function select() {
  if (!live()) return
  if (isNative()) Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {})
  else webVibrate(14)
}

/** Impact by emotional weight — for pivotal reveals (verdict, ending). */
export function impact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (!live()) return
  if (isNative()) {
    const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy }
    Haptics.impact({ style: map[style] }).catch(() => {})
  } else {
    webVibrate(style === 'heavy' ? 26 : style === 'light' ? 8 : 16)
  }
}

/** Success buzz — a post published, a positive milestone crossed. */
export function success() {
  if (!live()) return
  if (isNative()) Haptics.notification({ type: NotificationType.Success }).catch(() => {})
  else webVibrate([12, 40, 14])
}
