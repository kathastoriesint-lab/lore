'use client'
// Pure Creator-House rules — no content data. Kept separate from lib/data.ts and
// lib/dossier.ts (now content-only, served as JSON) so those modules stay OUT of
// the client bundle. Functions read live content via the provider.
import { getCHSituations } from './content'
import type { Meters, Situation } from './types'

// Dossier unlock thresholds (moved from lib/dossier.ts).
export const TRUTH_BOND = 45   // "mask ke peeche dekh liya"
export const SECRET_BOND = 68  // "ab woh tujhpe sach ke saath bharosa karte hain"

// Visible Creator-House situations — the full Season 1 arc (Days 1-10), all now
// authored in the cinematic reader[] format. (Previously capped to Day 1 while
// Days 2-10 were old prose; uncapped once they were converted.)
// The meters/choices params are reserved for future conditional branching.
export function getVisibleSituations(_meters?: Meters, _choices?: ('A' | 'B')[]): Situation[] {
  return getCHSituations()
}
