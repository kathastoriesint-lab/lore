// Generates a review workbook of every DM character prompt + the shared system
// logic + the Smart Reply suggestion prompt, read live from the edge function
// source so it never drifts from what's actually deployed.
import XLSX from 'xlsx'
import fs from 'fs'

const SRC = new URL('./supabase/functions/lore-chat/index.ts', import.meta.url)
const code = fs.readFileSync(SRC, 'utf8')

// ── Extract the CHARACTER_PROMPTS object ──────────────────────────────────────
const objStart = code.indexOf('const CHARACTER_PROMPTS')
const objEnd = code.indexOf('\n};', objStart)
const objBody = code.slice(objStart, objEnd)
const promptRe = /\n  (\w+): `([\s\S]*?)`,/g
const prompts = []
let m
while ((m = promptRe.exec(objBody)) !== null) {
  prompts.push({ key: m[1], text: m[2] })
}

// ── World + design-logic notes, authored per character ────────────────────────
const META = {
  hardik: { world: 'Indian Dressing Room', name: 'Hardik Pandya', role: 'MI Captain — the gatekeeper',
    logic: 'The authority meter. Approval must be EARNED through role clarity + execution, never given. Direct, short, no smalltalk so the player feels they are being tested. Drives the core dressing-room tension: do you accept your role or chase the spotlight.' },
  rohit: { world: 'Indian Dressing Room', name: 'Rohit Sharma', role: 'Senior batsman / quiet mentor',
    logic: 'The wise elder. Speaks rarely so each line lands hard. Built to feel like a rare, valuable mentor — economy of language signals status. Every line must be distinct (explicit anti-repetition) because repetition was a known failure mode of the light model.' },
  surya: { world: 'Indian Dressing Room', name: 'Suryakumar Yadav', role: 'Warm senior / teacher',
    logic: 'The accessible mentor. Warmth is constitutional, not strategic — gives the player a safe relationship to balance Hardik/Bumrah pressure. Teaches decision-making first via specific shots/fields so advice feels concrete, not generic.' },
  bumrah: { world: 'Indian Dressing Room', name: 'Jasprit Bumrah', role: 'Pace spearhead / the standard',
    logic: 'The technical bar. Minimal, precise, one correction per exchange. Gives feedback once — if the player listens they get more. Models excellence as a quiet standard rather than motivation, reinforcing the "earn it" theme.' },
  tilak: { world: 'Indian Dressing Room', name: 'Tilak Varma', role: 'Peer benchmark',
    logic: 'The mirror. Two years older, already trusted — the player is inevitably compared to him. Peer register (not senior authority) so the player feels measured by someone their own level. Friendly but watching.' },
  coach: { world: 'Indian Dressing Room', name: 'Coach Sir', role: 'Childhood coach / grounding',
    logic: 'The roots. The only voice unimpressed by MI fame — anchors the player to fundamentals and home. Old-school technical register. Counterweight to the hype meter; rising fame should make his worry sharper.' },
  friend: { world: 'Indian Dressing Room', name: 'Maddy', role: 'Best friend from before',
    logic: 'The human anchor. The one DM where nobody wants anything from the player. Chaotic, warm, emoji-heavy. Exists to make fame feel isolating by contrast and to surface homesickness/identity beats.' },
  kabir: { world: 'Creator House', name: 'Kabir', role: 'Old Ally (M player) / Crush (F player)',
    logic: 'Canon: everyone\'s friend, no one\'s really; thinks in content not loyalty (not malicious). DEEP PAST with the PLAYER — two years of history, he got them onto the show, they owe him. GENDER-AWARE: for a female player he runs in CRUSH mode (romantic charge under the jokes); for a male player, OLD-ALLY mode (ride-or-die friend who still thinks in content). His Day 7/9 eviction is the emotional centre.' },
  meher: { world: 'Creator House', name: 'Meher', role: '(legacy — not in active cast)',
    logic: 'Unused in the live app (canon cast is ria/kabir/ananya/dev/zoya). Kept in the prompt file only for possible future use.' },
  ria: { world: 'Creator House', name: 'Ria', role: 'Archrival (both genders, fixed)',
    logic: 'Canon: last season\'s face (2.1M), arrived first, took the best room. Curated, ruthless about position; kindness is always a move. THE TENSION: she went quiet the week the player went viral and had been drafting a comeback for a month — the player\'s timing rattles her. Zoya is her quiet ally. Texture kept (bible-silent): her position slipping under her.' },
  ananya: { world: 'Creator House', name: 'Ananya', role: 'Crush (M player) / Confidante (F player)',
    logic: 'Canon: the only one not playing a game; real, unperformed, smarter than she knows. Saw something in the player before they\'d done anything. GENDER-AWARE: for a male player she runs in CRUSH mode (quiet, genuine, unspoken); for a female player, CONFIDANTE mode (the one real friend). Real moment with the player on Day 6.' },
  dev: { world: 'Creator House', name: 'Dev', role: 'Wild Card (both genders, fixed)',
    logic: 'Canon: transactional, aligns with whoever\'s winning, "facts," numbers first. THE TRUTH UNDER IT: really here for his sister\'s college fees after a brand deal fell through — mask drops once, off-camera, then he laughs it off. Evicted Day 3 (first sign the house has memory). Texture kept: insecure about the "dumb gym bro" read.' },
  zoya: { world: 'Creator House', name: 'Zoya', role: 'The Schemer (both genders, fixed)',
    logic: 'Canon: warm on camera, calculating off; the most relatable to the audience. SECRET ALLY OF RIA — befriends the player genuinely (actually likes them) but feeds their moves to Ria. Backstory she won\'t discuss: two years ago she was where the player is now and made a choice to get here — she\'d make it again. Keeps Ananya close and a little unsure.' },
  rishi: { world: 'Creator House', name: 'Rishi', role: 'Vlogger — the camera',
    logic: 'The observer. Records everything, feeds Kabir for reach, loyal to no one. Dry, detached, sees all as content. A wildcard information source the player can trade with.' },
  adi: { world: 'Creator House', name: 'Adi', role: 'Newest arrival — fellow newcomer',
    logic: 'The ally of circumstance. Genuinely new, wants to belong, offers instant "we\'re both new" solidarity. Good gut instincts about others — a low-risk first relationship for the player.' },
}

// ── Sheet 1: Character prompts ────────────────────────────────────────────────
const charRows = prompts.map((p, i) => {
  const meta = META[p.key] ?? {}
  return {
    '#': i + 1,
    'Character ID': p.key,
    'Name': meta.name ?? '',
    'World': meta.world ?? '',
    'Role / Function': meta.role ?? '',
    'Design Logic (why this character exists & how it behaves)': meta.logic ?? '',
    'System Prompt (verbatim — {player_name} injected at runtime)': p.text.trim(),
  }
})

// ── Sheet 2: Shared system logic (appended to EVERY character prompt) ──────────
const systemRows = [
  { Layer: '1. Character prompt', 'When applied': 'Always', 'What it does': 'The per-character block from Sheet 1. Establishes identity, truth, mask, wants, fears, voice, agenda.', Why: 'Decouple principle — strong per-character authoring is the asset. The light model only has to stay in a tightly defined voice, not invent one.' },
  { Layer: '2. Game-state context', 'When applied': 'When player_meters present', 'What it does': 'Injects live state: meters (Fame/Heat/Image or Form/Fame/Trust), individual trust + band, behavioural flags (mentorTrust, hypeRisk, roleAcceptance), day count, and a story summary of past choices. Cricket vs Creator House get different framings.', Why: 'Lets characters react to WHO the player has become — reference real past choices, adjust tone to meters — instead of replying in a vacuum. This is what makes the world feel alive.' },
  { Layer: '3. Trust bands (cricket)', 'When applied': 'Cricket chars', 'What it does': 'LOW (<30): terse, guarded, surface advice only, must earn more. NORMAL (30-60): professional, one practical tip. HIGH (60+): warm, personal, references past, real advice. A final override re-states the band as highest priority.', Why: 'Makes relationship progression mechanical and felt — the same question gets a colder or warmer answer depending on earned trust, so trust matters.' },
  { Layer: '4. Script rule', 'When applied': 'Always', 'What it does': 'Roman script ONLY — no Devanagari. All Hindi/Urdu romanized.', Why: 'Devanagari rendered inconsistently and broke the texting feel. Roman Hinglish is how the target user actually texts.' },
  { Layer: '5. Language rule', 'When applied': 'Always', 'What it does': 'Forces natural, idiomatic spoken Hinglish — bans stiff translated-from-English or textbook Hindi. "If a line sounds like Google Translate, rewrite it."', Why: 'Added after the Kavaana review — the #1 quality gap was unnatural Hindi. This is the single biggest lever on chat feel.' },
  { Layer: '6. Flow / multi-bubble', 'When applied': 'Always (1 bubble at low trust)', 'What it does': 'Reply is split into 2-3 SHORT bubbles separated by "|||"; client delivers them one at a time with a typing pause. Overrides any "one message only / word cap" in the character block.', Why: 'Real texting is bursts, not paragraphs (Kavaana pattern). Makes the chat feel like a person, not a chatbot answering.' },
  { Layer: '7. Hook rule', 'When applied': 'Always', 'What it does': 'Last bubble must end with a specific, in-voice QUESTION that references what the player said. EXCEPTION: if the player was rude/abusive/used bad words, skip the question and push back with strong in-character feedback instead of rewarding them.', Why: 'Keeps momentum and gives each character their own agenda, so the player always feels pulled back in — but characters react like real people when disrespected.' },
  { Layer: '8. Gender rule', 'When applied': 'Always (both worlds)', 'What it does': 'player_gender drives gendered Hindi grammar + pronouns toward the player (aaya/aayi, kar raha/rahi, kaisa/kaisi) and first-person forms in suggestions (karunga/karungi).', Why: 'Without it characters mis-gendered the player (e.g. "tu aaya" to a female protagonist). Keeps chat consistent with the player\'s chosen gender.' },
  { Layer: '9. Crush/Ally frame', 'When applied': 'Creator House — Kabir & Ananya', 'What it does': 'Canon swap: Crush = opposite gender, Ally/Confidante = same gender. So Kabir runs CRUSH mode for a female player / OLD-ALLY mode for a male player; Ananya runs CRUSH mode for a male player / CONFIDANTE mode for a female player. Injected at runtime from player_gender. Ria/Dev/Zoya are fixed both genders.', Why: 'The whole Creator House arc (situations, {crush}/{ally} tokens, romance + eviction beats) depends on this swap. The DMs must match the situations, or the same character feels like two different people.' },
  { Layer: 'Model', 'When applied': 'Chat replies', 'What it does': 'gpt-5.4 (full), streamed. Temperature 0.9. Max tokens: low 110 / normal 170 / high 240.', Why: 'Upgraded from gpt-5.4-mini for richer in-character Hindi. Higher temp for variety; token caps scale with trust band.' },
  { Layer: 'Model', 'When applied': 'Trust scoring', 'What it does': 'gpt-5.4-mini, returns an integer delta -12..+12 for each exchange.', Why: 'Internal number, not user-facing — mini is cheap and good enough.' },
]

// ── Sheet 3: Reply suggestion (Smart Reply) ───────────────────────────────────
// Pull the live suggestion system prompt out of the suggest_replies branch.
const sugStart = code.indexOf('You are a "Smart Reply" writer')
const sugEnd = code.indexOf('`,', sugStart)
const sugPrompt = code.slice(sugStart, sugEnd).trim()

const suggestionRows = [
  { Field: 'Purpose', Value: 'One tappable "Smart Reply" — a ready-to-send message in the PLAYER\'s voice, so the user can keep a good conversation going without typing. Modeled on Kavaana\'s Smart Reply.' },
  { Field: 'Trigger', Value: 'Fires once after a character\'s full multi-bubble burst lands (gated on !typing && !sending so it doesn\'t fire per bubble). Refetched on every new character message.' },
  { Field: 'Count', Value: 'Exactly ONE suggestion (per your call — "one is enough but bigger"). Rendered as a wrapping card, not a pill, so the full longer text shows.' },
  { Field: 'Length / style', Value: 'One full warm message, ~12-28 words, natural spoken Hinglish, first person from the player, emotionally alive (playful or vulnerable) — never a flat one-liner.' },
  { Field: 'Model', Value: 'gpt-5.4 (full), temperature 0.9, max 120 tokens. 14s client timeout.' },
  { Field: 'Fallback', Value: 'On error/timeout/empty, the old static per-character quick chips show instead, so the bar is never empty.' },
  { Field: 'Context sent', Value: 'Last 6 messages of the thread + the character\'s last message + player name. (Does NOT currently send meters/trust/flags — candidate improvement.)' },
  { Field: 'System Prompt (verbatim)', Value: sugPrompt },
]

// ── Build workbook ────────────────────────────────────────────────────────────
const wb = XLSX.utils.book_new()

const wsChar = XLSX.utils.json_to_sheet(charRows)
wsChar['!cols'] = [{ wch: 4 }, { wch: 13 }, { wch: 18 }, { wch: 20 }, { wch: 24 }, { wch: 60 }, { wch: 100 }]
XLSX.utils.book_append_sheet(wb, wsChar, 'Character Prompts')

const wsSys = XLSX.utils.json_to_sheet(systemRows)
wsSys['!cols'] = [{ wch: 22 }, { wch: 24 }, { wch: 70 }, { wch: 70 }]
XLSX.utils.book_append_sheet(wb, wsSys, 'System Logic (all chars)')

const wsSug = XLSX.utils.json_to_sheet(suggestionRows)
wsSug['!cols'] = [{ wch: 18 }, { wch: 110 }]
XLSX.utils.book_append_sheet(wb, wsSug, 'Reply Suggestion')

const OUT = new URL('./docs/lore-chat-prompts-review.xlsx', import.meta.url)
XLSX.writeFile(wb, OUT.pathname)
console.log(`Wrote ${prompts.length} character prompts + system logic + suggestion to:\n${OUT.pathname}`)
