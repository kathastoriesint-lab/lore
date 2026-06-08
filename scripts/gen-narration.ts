/**
 * One-off: pre-generate + cache narration MP3s for the first 5 situations.
 * Reproduces LiveScreen's exact narration text so the server cache hash
 * matches what the app requests at runtime:
 *   text = [title, ...body].map(p => stripHtml(resolveTokens(p, name, gender))).join('. ')
 *
 * Run with the dev server up:  bun run scripts/gen-narration.ts
 */
import { SITUATIONS } from '../lib/data'
import { CRICKET_SITUATIONS } from '../lib/cricket-data'
import type { Situation } from '../lib/types'

const ENDPOINT = 'http://localhost:3000/api/narrate'

// Exact copies of lib/game.ts resolveTokens + LiveScreen.stripHtml
const resolveTokens = (text: string, playerName: string, gender: 'male' | 'female', friendName = 'Maddy') => {
  const male = gender === 'male'
  const crush = male ? 'Ananya' : 'Kabir'
  const ally = male ? 'Kabir' : 'Ananya'
  return text
    .replaceAll('{name}', playerName || 'Tum')
    .replaceAll('{friend}', friendName)
    .replaceAll('{crush}', crush)
    .replaceAll('{ally}', ally)
    .replace(/\{p\|([^/|}]*)\/([^|}]*)\}/g, (_m, a, b) => (male ? a : b))
    .replace(/\{x\|([^/|}]*)\/([^|}]*)\}/g, (_m, a, b) => (male ? b : a))
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}
const stripHtml = (s: string) => s.replace(/<[^>]+>/g, '')

const narrationText = (sit: Situation, name: string, gender: 'male' | 'female') =>
  [sit.title, ...sit.body].map(p => stripHtml(resolveTokens(p, name, gender))).join('. ')

const chQueue = SITUATIONS.slice(0, 5)
const cricketQueue = CRICKET_SITUATIONS.filter(s => s.id !== 'CR-S28').slice(0, 5)

// Variants: CH differs by gender (no {name}). Cricket first-5 has no name/gender
// tokens in its narrated text, so a single render covers every player.
const jobs: { label: string; text: string }[] = []
for (const g of ['male', 'female'] as const)
  chQueue.forEach((s, i) => jobs.push({ label: `CH/${g}/s${i + 1} ${s.id}`, text: narrationText(s, '', g) }))
cricketQueue.forEach((s, i) => jobs.push({ label: `CRICKET/s${i + 1} ${s.id}`, text: narrationText(s, '', 'male') }))

// Dedupe identical texts (e.g. CH situations with no gender token → same for M/F)
const seen = new Set<string>()
let ok = 0, cached = 0, failed = 0
for (const job of jobs) {
  if (seen.has(job.text)) { console.log(`  = dup  ${job.label}`); continue }
  seen.add(job.text)
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: job.text }),
    })
    if (!res.ok) { failed++; console.log(`  ✗ ${res.status} ${job.label}: ${await res.text()}`); continue }
    const bytes = (await res.arrayBuffer()).byteLength
    ok++
    console.log(`  ✓ ${job.label} (${bytes} bytes)`)
  } catch (e) {
    failed++
    console.log(`  ✗ ERR ${job.label}: ${e instanceof Error ? e.message : e}`)
  }
}
console.log(`\nDone. unique=${seen.size} ok=${ok} failed=${failed}`)
