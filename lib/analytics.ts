'use client'
import { createClient } from './supabase'

const DEVICE_ID_KEY = 'lore_device_id'
const FLUSH_INTERVAL_MS = 30_000

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

type EventRow = {
  device_id: string
  session_id: string | null
  user_id: string | null
  occurred_at: string
  event_type: string
  world_id: string | null
  properties: Record<string, unknown>
}

type ScreenViewRow = {
  device_id: string
  session_id: string | null
  screen: string
  world_id: string | null
  entered_at: string
  exited_at: string
  duration_seconds: number
  referrer_screen: string | null
}

class Analytics {
  private deviceId = ''
  private sessionId: string | null = null
  private userId: string | null = null
  private db: ReturnType<typeof createClient> | null = null
  private eventQueue: EventRow[] = []
  private screenQueue: ScreenViewRow[] = []
  private currentScreen: { name: string; worldId: string | null; enteredAt: number; referrer: string | null } | null = null
  private flushTimer: ReturnType<typeof setInterval> | null = null
  private ready = false

  init(userId: string | null) {
    if (typeof window === 'undefined' || this.ready) return
    this.ready = true
    this.deviceId = getDeviceId()
    this.userId = userId
    this.db = createClient()
    this._startSession()
    this.flushTimer = setInterval(() => this._flush(), FLUSH_INTERVAL_MS)
    document.addEventListener('visibilitychange', this._onVisibility)
  }

  private _onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      // Close current screen view before flushing
      if (this.currentScreen) this._closeCurrentScreen()
      this._flush()
      this.sessionId = null
    } else {
      this._startSession()
    }
  }

  private async _startSession() {
    if (!this.db) return
    try {
      const { data } = await this.db
        .from('analytics_sessions')
        .insert({ device_id: this.deviceId, user_id: this.userId, platform: 'web' })
        .select('id')
        .single()
      this.sessionId = data?.id ?? null
    } catch {}
  }

  trackScreen(screen: string, worldId: string | null, referrer: string | null) {
    if (!this.ready) return
    this._closeCurrentScreen()
    this.currentScreen = { name: screen, worldId, enteredAt: Date.now(), referrer }
  }

  private _closeCurrentScreen() {
    if (!this.currentScreen) return
    const { name, worldId, enteredAt, referrer } = this.currentScreen
    this.screenQueue.push({
      device_id: this.deviceId,
      session_id: this.sessionId,
      screen: name,
      world_id: worldId,
      entered_at: new Date(enteredAt).toISOString(),
      exited_at: new Date().toISOString(),
      duration_seconds: Math.round((Date.now() - enteredAt) / 1000),
      referrer_screen: referrer,
    })
    this.currentScreen = null
  }

  track(eventType: string, worldId: string | null = null, properties: Record<string, unknown> = {}) {
    if (!this.ready) return
    this.eventQueue.push({
      device_id: this.deviceId,
      session_id: this.sessionId,
      user_id: this.userId,
      occurred_at: new Date().toISOString(),
      event_type: eventType,
      world_id: worldId,
      properties,
    })
  }

  setUserId(id: string) {
    this.userId = id
  }

  private async _flush() {
    if (!this.db) return
    const events = this.eventQueue.splice(0)
    const screens = this.screenQueue.splice(0)
    try {
      if (events.length > 0) await this.db.from('analytics_events').insert(events)
      if (screens.length > 0) await this.db.from('analytics_screen_views').insert(screens)
    } catch {
      // Re-queue on failure so data isn't lost
      this.eventQueue = [...events, ...this.eventQueue]
      this.screenQueue = [...screens, ...this.screenQueue]
    }
  }

  destroy() {
    if (this.flushTimer) clearInterval(this.flushTimer)
    document.removeEventListener('visibilitychange', this._onVisibility)
    this.ready = false
  }
}

export const analytics = new Analytics()
