// Generate full-English variants of the story content JSONs.
//   node scripts/translate-content.mjs [--only cricket|ch] [--limit N]
//
// Walks each published content file, collects every human-visible string,
// translates Hinglish → natural English via OpenAI in batches, and writes
// <file>-en.json alongside (same shape, same version — the language never
// races the version system; 'en' is a parallel render of the same content).
//
// What is NOT translated (structure/identity):
//   - denylisted keys (ids, image paths, css classes, handles, colors, …)
//   - values that look like ids/paths/colors/single tokens
// What IS preserved inside translated text:
//   - {name} {crush} {ally} template tokens (gender-pair tokens like
//     {aaya|aayi} are collapsed to neutral English by the model)
//   - *italic* markers, ||| bubble separators, emoji, line breaks
import { readFileSync, writeFileSync } from 'node:fs'

// ── env ─────────────────────────────────────────────────────────────────────
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const KEY = env.OPENAI_API_KEY
if (!KEY) { console.error('No OPENAI_API_KEY in .env.local'); process.exit(1) }

const args = process.argv.slice(2)
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
const limit = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity

// ── which strings to translate ──────────────────────────────────────────────
const KEY_DENY = new Set([
  'id', 'img', 'imageUrl', 'avatarUrl', 'cls', 'color', 'char', 'charId',
  'handle', 'init', 'account', 'phase', 'flag', 'key', 'metric', 'world',
  'source', 'postTag', 'version', 'file', 'name',
])
function translatable(key, value) {
  if (typeof value !== 'string') return false
  if (KEY_DENY.has(key)) return false
  const v = value.trim()
  if (!v) return false
  if (v.startsWith('/') || v.startsWith('http')) return false        // paths/urls
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return false                    // colors
  if (/^[A-Z0-9][A-Z0-9-]*$/.test(v)) return false                   // IDs: CR2-S1, EV-D3, MORNING
  if (!v.includes(' ') && v.length < 20) return false                // single tokens: charIds, handles, names
  return true
}

function collect(node, path, out, parentKey = '') {
  if (Array.isArray(node)) node.forEach((v, i) => {
    if (typeof v === 'string') {
      if (translatable(parentKey, v)) out.push({ path: [...path, i], text: v })
    } else collect(v, [...path, i], out, parentKey)
  })
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (translatable(k, v)) out.push({ path: [...path, k], text: v })
      else collect(v, [...path, k], out, k)
    }
  }
}
function setAt(root, path, value) {
  let n = root
  for (let i = 0; i < path.length - 1; i++) n = n[path[i]]
  n[path[path.length - 1]] = value
}

// ── translation ─────────────────────────────────────────────────────────────
const SYSTEM = `You localize an Indian interactive-fiction app from Hinglish (Hindi-English code-mix, Roman script) into natural English for a global audience (e.g. American readers). This is a creative localization, NOT a literal translation.

VOICE — the entire product is characters with strong voices. Preserve each line's energy exactly:
- Terse stays terse ("Theek. Kal noise band, bas role." → "Good. Tomorrow: no noise, just your role.")
- Flirty stays flirty, bestie-banter stays banter, menace stays menace.
- Keep it punchy, modern, texting-register English. Never formal, never translated-sounding.

HARD RULES:
1. Keep {name}, {crush}, {ally} tokens EXACTLY as-is wherever they appear.
2. Gender-pair tokens like {aaya|aayi} or {khada|khadi}: collapse to neutral natural English (no token in output).
3. Keep *asterisk italics*, ||| separators, emoji, \\n line breaks, and ALL-CAPS emphasis in place.
4. Keep proper nouns: names (Kabir, Zoya, Maddy, Hardik, Rohit…), places (Wankhede, Mumbai), team/brand names, hashtags (translate hashtag words only if they are sentences).
5. Cricket terms stay cricket terms (nets, yorker, team sheet, 12th man). Reality-show terms stay (eviction, nominations, vote).
6. Address words: bhai/yaar/bro → natural English equivalents (bro, man, dude); "sir/bhaiya" to a senior → "sir" or the name, keeping the respect register.
7. Same message count and structure: output array MUST have exactly the same length and order as the input array. Translate each string independently.

Return ONLY a JSON object: {"t": ["…", "…", …]} with the translated strings in order.`

async function translateBatch(texts, attempt = 0) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
    body: JSON.stringify({
      model: 'gpt-5.4',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: JSON.stringify(texts) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    }),
  })
  if (!resp.ok) {
    const e = await resp.text()
    if (attempt < 3) { await new Promise(r => setTimeout(r, 2000 * (attempt + 1))); return translateBatch(texts, attempt + 1) }
    throw new Error(`OpenAI ${resp.status}: ${e.slice(0, 300)}`)
  }
  const data = await resp.json()
  let out
  try { out = JSON.parse(data.choices[0].message.content).t } catch { out = null }
  if (!Array.isArray(out) || out.length !== texts.length) {
    if (attempt < 3) return translateBatch(texts, attempt + 1)
    throw new Error(`batch shape mismatch: sent ${texts.length}, got ${out?.length}`)
  }
  return out.map((s, i) => (typeof s === 'string' && s.trim() ? s : texts[i]))
}

function getAt(root, path) {
  let n = root
  for (const k of path) { if (n == null) return undefined; n = n[k] }
  return n
}

async function run(name, srcFile) {
  const src = JSON.parse(readFileSync(`public/content/${srcFile}`, 'utf8'))
  const destFile = srcFile.replace('.json', '-en.json')
  let existing = null
  try { existing = JSON.parse(readFileSync(`public/content/${destFile}`, 'utf8')) } catch {}
  const strings = []
  collect(src, [], strings)
  // top-up: skip strings the existing -en file already translated
  const pending = existing ? strings.filter(s => getAt(existing, s.path) === s.text) : strings
  console.log(`${name}: ${strings.length} translatable, ${pending.length} still untranslated`)
  const todo = pending.slice(0, limit)
  console.log(`${name}: ${strings.length} translatable strings (${todo.length} this run)`)

  const BATCH = 30, CONCURRENCY = 4
  let next = 0, done = 0
  const allBatches = []
  for (let i = 0; i < todo.length; i += BATCH) allBatches.push(todo.slice(i, i + BATCH))
  const out = new Array(allBatches.length)
  async function pool() {
    while (next < allBatches.length) {
      const i = next++
      out[i] = await translateBatch(allBatches[i].map(s => s.text))
      done += allBatches[i].length
      process.stdout.write(`\r  ${name}: ${Math.min(done, todo.length)}/${todo.length}   `)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, pool))
  console.log()

  const en = existing ?? JSON.parse(JSON.stringify(src))
  allBatches.forEach((batch, bi) => batch.forEach((s, si) => setAt(en, s.path, out[bi][si])))
  writeFileSync(`public/content/${destFile}`, JSON.stringify(en, null, 1))
  console.log(`  wrote public/content/${destFile}`)
}

if (!only || only === 'cricket') await run('cricket', 'cricket-v15.json')
if (!only || only === 'ch') await run('creator-house', 'creator-house-v4.json')
console.log('done')
