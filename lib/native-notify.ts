'use client'
// Native lock-timer notification. The 3h interlude lock's whole premise is
// "come back when the squad is announced" — on the Capacitor Android app we
// schedule a local notification at lockExpiresAt so the player gets nudged back.
// All calls no-op on the web (Capacitor.isNativePlatform() === false), so this
// is safe to import and call from the shared web codebase.
import { Capacitor } from '@capacitor/core'

const LOCK_NOTIF_ID = 1001

export async function scheduleLockNotification(lockExpiresAt: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const perm = await LocalNotifications.requestPermissions()
    if (perm.display !== 'granted') return
    await LocalNotifications.cancel({ notifications: [{ id: LOCK_NOTIF_ID }] })
    if (lockExpiresAt <= Date.now()) return
    await LocalNotifications.schedule({
      notifications: [{
        id: LOCK_NOTIF_ID,
        title: 'Squad announcement is ready 🏏',
        body: 'Dekho tum XI mein aaye ya nahi.',
        schedule: { at: new Date(lockExpiresAt) },
      }],
    })
  } catch { /* web / plugin unavailable */ }
}

export async function cancelLockNotification(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: LOCK_NOTIF_ID }] })
  } catch { /* ignore */ }
}

const MATCHDAY_NOTIF_ID = 1002

// Break-over push — THE return trigger the 6h week break assumes. Fires at
// weekUnlockAt; cancelled if the player earns a skip (both break DMs done).
export async function scheduleMatchDayNotification(unlockAt: number, week: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const perm = await LocalNotifications.requestPermissions()
    if (perm.display !== 'granted') return
    await LocalNotifications.cancel({ notifications: [{ id: MATCHDAY_NOTIF_ID }] })
    if (unlockAt <= Date.now()) return
    await LocalNotifications.schedule({
      notifications: [{
        id: MATCHDAY_NOTIF_ID,
        title: 'Break khatam — agla match 🏏',
        body: `Week ${week} shuru. Dressing room wapas aao — story khul gayi hai.`,
        schedule: { at: new Date(unlockAt) },
      }],
    })
  } catch { /* web / plugin unavailable */ }
}

export async function cancelMatchDayNotification(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: MATCHDAY_NOTIF_ID }] })
  } catch { /* ignore */ }
}
