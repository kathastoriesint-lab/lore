/**
 * Publish story content as versioned JSON.
 *
 * CRICKET: lib/cricket-data.ts is the AUTHORING SOURCE — this script serializes it
 * to public/content/cricket-v<N>.json (the bundled fallback AND the same-origin
 * fetch fallback) and updates the manifest's cricket entry. Runs on `prebuild` so
 * the JSON can't drift from the TS.
 *
 * CREATOR HOUSE: authored DIRECTLY in public/content/creator-house-v2.json (the
 * cinematic reader[] rewrite happened in the JSON; lib/data.ts is stale legacy and
 * MUST NOT be published — regenerating from it would stomp the live story). This
 * script therefore leaves the CH file alone and PRESERVES the existing manifest
 * entry for it. If CH authoring ever moves back to TS, re-add it deliberately.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'
import {
  CRICKET_CHARS, CRICKET_SITUATIONS, CRICKET_NARR_LINES, CRICKET_NARR_CHARS,
  CRICKET_DM_TRUST_START, CRICKET_TRUST_GOALS, CRICKET_LOW_TRUST_FEED,
  CRICKET_SOCIAL_ACCOUNTS, CRICKET_ENDING_DATA, CRICKET_DM_HOOKS, CRICKET_DM_MOCK,
} from '../lib/cricket-data'

// Bump when cricket content shape or data changes meaningfully. The filename
// carries the version so CDN/build caches can never serve a stale copy under
// a fresh name (see the creator-house v1→v2 cache-bust incident, 2026-06-30).
const CRICKET_VERSION = 5

const cricket = {
  version: CRICKET_VERSION,
  chars: CRICKET_CHARS,
  situations: CRICKET_SITUATIONS,
  narrLines: CRICKET_NARR_LINES,
  narrChars: CRICKET_NARR_CHARS,
  dmTrustStart: CRICKET_DM_TRUST_START,
  trustGoals: CRICKET_TRUST_GOALS,
  lowTrustFeed: CRICKET_LOW_TRUST_FEED,
  socialAccounts: CRICKET_SOCIAL_ACCOUNTS,
  endingData: CRICKET_ENDING_DATA,
  dmHooks: CRICKET_DM_HOOKS,
  dmMock: CRICKET_DM_MOCK,
}

const dir = join(process.cwd(), 'public', 'content')
mkdirSync(dir, { recursive: true })

// Preserve the existing manifest (esp. the creator-house entry) — only the
// cricket entry is owned by this script.
const manifestPath = join(dir, 'manifest.json')
let manifest: Record<string, { version: number; file: string }> = {}
try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) } catch { /* first run */ }
manifest.cricket = { version: CRICKET_VERSION, file: `cricket-v${CRICKET_VERSION}.json` }

writeFileSync(join(dir, `cricket-v${CRICKET_VERSION}.json`), JSON.stringify(cricket) + '\n')
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')

console.log(`Published cricket-v${CRICKET_VERSION} (${CRICKET_SITUATIONS.length} situations); creator-house entry preserved (${manifest['creator-house']?.file ?? 'none'})`)
