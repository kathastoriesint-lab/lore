'use client'
// Backend-served story content with a bundled fallback.
//
// Design (eng-review refined):
// - Renders from the BUNDLED JSON immediately — no boot gate, zero cold-start
//   latency, works offline (finding 4).
// - Refreshes from a remote source in the background; applies a newer version
//   only if it passes shape validation, else keeps last-known-good → bundled
//   (finding 2). A bad content publish can't brick the app.
// - Never swaps mid-run: callers read accessors at boot/world-entry, and a new
//   version is cached for the next read, not spliced into an active session.
//
// Remote source: NEXT_PUBLIC_CONTENT_URL (the Supabase Storage CDN, set at
// deploy) if present, else the same-origin /content (the committed public
// files). The TS module lib/cricket-data.ts stays the authoring source; this
// module is what the app reads.
import type { Character, Situation, CharId } from './types'
import type { Dossier } from './dossier'
import type { PostCommentOption } from './data'
import cricketBundled from '@/public/content/cricket-v15.json'
import chBundled from '@/public/content/creator-house-v4.json'
import { getLang } from './lang'

export interface CricketContent {
  version: number
  chars: Record<string, Character>
  situations: Situation[]
  narrLines: Array<{ text: string; cls?: string }>
  narrChars: Array<[CharId, string]>
  dmTrustStart: Partial<Record<CharId, number>>
  trustGoals: Partial<Record<CharId, { unlocks: string; tips: string[] }>>
  lowTrustFeed: Partial<Record<CharId, string>>
  socialAccounts: Record<string, unknown>
  endingData: Record<string, { arc: string; sub: string; color: string }>
  dmHooks: Partial<Record<CharId, string>>
  dmMock: Partial<Record<CharId, string[]>>
}

// Active content — starts as the bundled fallback.
let cricket: CricketContent = cricketBundled as unknown as CricketContent

const LKG_KEY = 'lore_content_cricket' // last-known-good cache

// Shape check — rejects a malformed/partial remote publish so a bad upload can't
// break every client that fetches it. Requires every bundle key the accessors
// dereference (not just version/situations): a publish missing e.g. `narrChars`
// or `dmHooks` would pass a shallow check yet crash a screen at render, and — if
// its version ≥ bundled — would override the good bundled content. Rejecting it
// keeps the known-good bundled/LKG content live.
function hasKeys(x: Record<string, unknown>, objs: readonly string[], arrs: readonly string[]): boolean {
  for (const k of objs) if (!x[k] || typeof x[k] !== 'object' || Array.isArray(x[k])) return false
  for (const k of arrs) if (!Array.isArray(x[k])) return false
  return true
}

export function isValidCricketContent(c: unknown): c is CricketContent {
  if (!c || typeof c !== 'object') return false
  const x = c as Record<string, unknown>
  if (typeof x.version !== 'number') return false
  if (!Array.isArray(x.situations) || x.situations.length === 0) return false
  const okSituations = x.situations.every(
    (s) => !!s && typeof (s as { id?: unknown }).id === 'string' && Array.isArray((s as { choices?: unknown }).choices),
  )
  if (!okSituations) return false
  if (!hasKeys(x,
    ['chars', 'dmTrustStart', 'trustGoals', 'lowTrustFeed', 'socialAccounts', 'endingData', 'dmHooks', 'dmMock'],
    ['narrLines', 'narrChars'])) return false
  return true
}

// Apply a candidate if valid and not older than the active version; cache it.
function applyCricket(candidate: unknown): boolean {
  if (!isValidCricketContent(candidate)) return false
  if (candidate.version < cricket.version) return false
  cricket = candidate
  try { localStorage.setItem(LKG_KEY, JSON.stringify(candidate)) } catch { /* private mode / quota */ }
  return true
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch(url, { signal: ctrl.signal })
    if (!r.ok) return null
    return await r.json()
  } finally {
    clearTimeout(timer)
  }
}

// Call once at app boot. Non-blocking: bundled content is already live, this
// only upgrades it. Loads last-known-good first (offline-friendly), then tries
// the remote source. Any failure is swallowed — bundled keeps the game playable.
export async function initContent(): Promise<void> {
  // English mode (YC / non-Hindi readers): serve the bundled -en variants and
  // skip LKG/remote entirely — they hold Hinglish content and would fight the
  // language choice. English ships in the bundle, so it's always current.
  if (getLang() === 'en') {
    try {
      const [cr, chEn] = await Promise.all([
        import('@/public/content/cricket-v15-en.json'),
        import('@/public/content/creator-house-v4-en.json'),
      ])
      if (isValidCricketContent(cr.default)) cricket = cr.default as unknown as CricketContent
      if (isValidCHContent(chEn.default)) ch = chEn.default as unknown as CHContent
    } catch { /* bundled Hinglish stands */ }
    return
  }
  // Last-known-good from a previous session (offline-friendly).
  try { const c = localStorage.getItem(LKG_KEY); if (c) applyCricket(JSON.parse(c)) } catch { /* ignore */ }
  try { const c = localStorage.getItem(CH_LKG_KEY); if (c) applyCH(JSON.parse(c)) } catch { /* ignore */ }

  // Background remote refresh — both worlds, best-effort.
  try {
    const base = process.env.NEXT_PUBLIC_CONTENT_URL || '/content'
    const manifest = (await fetchJson(`${base}/manifest.json`, 1500)) as
      { cricket?: { file?: string }; 'creator-house'?: { file?: string } } | null
    const cf = manifest?.cricket?.file
    if (cf) applyCricket(await fetchJson(`${base}/${cf}`, 2500))
    const chf = manifest?.['creator-house']?.file
    if (chf) applyCH(await fetchJson(`${base}/${chf}`, 2500))
  } catch { /* ignore — bundled/LKG stands */ }
}

// ── Accessors — app code reads these instead of importing lib/cricket-data ──
export const getCricketChars = (): Record<string, Character> => cricket.chars
export const getCricketSituations = (): Situation[] => cricket.situations
export const getCricketNarrLines = () => cricket.narrLines
export const getCricketNarrChars = () => cricket.narrChars
export const getCricketDMTrustStart = () => cricket.dmTrustStart
export const getCricketTrustGoals = () => cricket.trustGoals
export const getCricketLowTrustFeed = () => cricket.lowTrustFeed
export const getCricketSocialAccounts = () => cricket.socialAccounts
export const getCricketEndingData = () => cricket.endingData
export const getCricketDMHooks = () => cricket.dmHooks
export const getCricketDMMock = () => cricket.dmMock

// ── Creator House content ───────────────────────────────────────────────────
export interface CHContent {
  version: number
  chars: Record<string, Character>
  situations: Situation[]
  narrLines: Array<{ text: string; cls?: string }>
  narrChars: Array<[CharId, string]>
  dmHooks: Partial<Record<string, string>>
  dmMock: Partial<Record<string, string[]>>
  dmOrder: CharId[]
  dmTrust: Partial<Record<string, number>>
  postComments: Record<string, PostCommentOption[]>
  dossiers: Partial<Record<CharId, Dossier>>
}

let ch: CHContent = chBundled as unknown as CHContent
const CH_LKG_KEY = 'lore_content_ch'

export function isValidCHContent(c: unknown): c is CHContent {
  if (!c || typeof c !== 'object') return false
  const x = c as Record<string, unknown>
  if (typeof x.version !== 'number') return false
  if (!Array.isArray(x.situations) || x.situations.length === 0) return false
  const okSituations = x.situations.every(
    (s) => !!s && typeof (s as { id?: unknown }).id === 'string' && Array.isArray((s as { choices?: unknown }).choices),
  )
  if (!okSituations) return false
  if (!hasKeys(x,
    ['chars', 'dmHooks', 'dmMock', 'dmTrust', 'postComments', 'dossiers'],
    ['narrLines', 'narrChars', 'dmOrder'])) return false
  return true
}

function applyCH(candidate: unknown): boolean {
  if (!isValidCHContent(candidate)) return false
  if (candidate.version < ch.version) return false
  ch = candidate
  try { localStorage.setItem(CH_LKG_KEY, JSON.stringify(candidate)) } catch { /* ignore */ }
  return true
}

export const getCHChars = (): Record<string, Character> => ch.chars
export const getCHSituations = (): Situation[] => ch.situations
export const getCHNarrLines = () => ch.narrLines
export const getCHNarrChars = () => ch.narrChars
export const getCHDMHooks = () => ch.dmHooks
export const getCHDMMock = () => ch.dmMock
export const getCHDMOrder = () => ch.dmOrder
export const getCHDMTrust = () => ch.dmTrust
export const getCHPostComments = () => ch.postComments
export const getCHDossiers = () => ch.dossiers
