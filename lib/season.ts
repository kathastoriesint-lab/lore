// Season 1 structure for the cricket world (Indian Dressing Room).
// Design doc: ~/.gstack/projects/Katha_MVP/nabhgarg-main-design-20260611-230931.md
//
// 29 playable beats (CR-S28 is filtered from the queue) chunked into 7 Match
// Weeks. Each week (except W1) has an entry GATE checked during the interlude
// between weeks. Gates 2-6 are soft: if the lock clock expires below the gate,
// the week opens with the fail-variant beat. Week 7 is the one hard gate.
//
// Cricket meter slots (storage → display): fame=FORM, heat=FAME, image=TEAM TRUST.

import type { Meters } from './types'

export const SENIORS = ['rohit', 'hardik', 'bumrah', 'surya'] as const

export type GateRequirement =
  | { kind: 'meter'; slot: keyof Meters; threshold: number; label: string; surface: 'nets' | 'feed' | 'live' }
  | { kind: 'charTrust'; charId: string; threshold: number; label: string; surface: 'dms' }
  | { kind: 'highestSeniorTrust'; threshold: number; label: string; surface: 'dms' }

export interface SeasonWeek {
  week: number
  name: string
  /** Situation ids belonging to this week, in queue order. */
  situationIds: string[]
  /** Entry gate — requirements to open this week. Empty for W1. */
  gate: GateRequirement[]
  /** Hard gate: week does not open below gate; expiry restarts the interlude. */
  hardGate?: boolean
  /** Which trust the HUD shows while this week is active. */
  hudTrustSource: 'team' | { charId: string } | 'highest-senior'
  /** Diegetic lock-screen copy shown during the interlude BEFORE this week. */
  lockCopy: string
  /** Beat shown when the gate was met (success variant). */
  successBeat: string
  /** Beat shown when the clock expired below the gate (fail variant). */
  failBeat: string
}

export const SEASON_WEEKS: SeasonWeek[] = [
  {
    week: 1, name: 'Arrival',
    situationIds: ['CR-S1', 'CR-S2', 'CR-S3', 'CR-S4'],
    gate: [],
    hudTrustSource: 'team',
    lockCopy: '',
    successBeat: '',
    failBeat: '',
  },
  {
    week: 2, name: 'The Nets',
    situationIds: ['CR-S5', 'CR-S6', 'CR-S7', 'CR-S8'],
    gate: [{ kind: 'meter', slot: 'fame', threshold: 45, label: 'FORM', surface: 'nets' }],
    hudTrustSource: 'team',
    lockCopy: 'Coach finalises the main nets group tomorrow morning.',
    successBeat: 'Team sheet on the dressing room door: you’re in the MAIN nets group. Bumrah ke saath. Coach ne khud naam likha.',
    failBeat: 'Team sheet on the door: reserves group. Coach walks past — "Form dikhao, phir baat karenge."',
  },
  {
    week: 3, name: 'The Debut',
    situationIds: ['CR-S9', 'CR-S10', 'CR-S11', 'CR-S12', 'CR-S13'],
    gate: [{ kind: 'meter', slot: 'fame', threshold: 52, label: 'FORM', surface: 'nets' }],
    hudTrustSource: 'team',
    lockCopy: 'Match vs RR in 2 days. Squad drops tomorrow 9am.',
    successBeat: 'Squad announcement: YOUR NAME in the XI. Wankhede debut. Phone explodes — {friend} calling, MI admin texting, sab kuch ek saath.',
    failBeat: '12th man. Drinks duty. Itne kareeb — coach bola "form thodi aur chahiye." The XI walks out without you.',
  },
  {
    week: 4, name: 'Hold Your Spot',
    situationIds: ['CR-S14', 'CR-S15', 'CR-S16', 'CR-S17'],
    gate: [{ kind: 'meter', slot: 'fame', threshold: 60, label: 'FORM', surface: 'nets' }],
    hudTrustSource: 'team',
    lockCopy: 'Next match vs KKR. Selection meeting tonight.',
    successBeat: 'Back-to-back selection. Pehli baar koi debate nahi hui — your name went on the sheet first.',
    failBeat: 'Rotated out. "Workload management," coach says. Everyone knows what it means.',
  },
  {
    week: 5, name: 'Win the Room',
    situationIds: ['CR-S18', 'CR-S19', 'CR-S20', 'CR-S21'],
    gate: [{ kind: 'charTrust', charId: 'rohit', threshold: 50, label: "ROHIT'S TRUST", surface: 'dms' }],
    hudTrustSource: { charId: 'rohit' },
    lockCopy: 'Away leg begins — flight to Chennai tomorrow.',
    successBeat: 'Press conference. Journalist tries a trap question about you. Rohit cuts him off: "Woh mera player hai. Next question."',
    failBeat: 'You board the flight as squad filler. Seniors ki row mein jagah nahi — abhi tak unka bharosa nahi jeeta.',
  },
  {
    week: 6, name: 'Become the Story',
    situationIds: ['CR-S22', 'CR-S23', 'CR-S24', 'CR-S25'],
    gate: [{ kind: 'meter', slot: 'heat', threshold: 60, label: 'FAME', surface: 'feed' }],
    hudTrustSource: 'team',
    lockCopy: 'Must-win stretch. The playoff race is on — and the press is choosing its heroes.',
    successBeat: 'Morning headlines: YOUR FACE. "MI ka naya sitara." The feed isn’t talking about the team — it’s talking about YOU.',
    failBeat: 'The papers cover the match. You’re a name on the scorecard, not the story. Not yet.',
  },
  {
    week: 7, name: 'The Call-Up',
    situationIds: ['CR-S26', 'CR-S27', 'CR-S29', 'CR-S30'],
    gate: [
      { kind: 'meter', slot: 'fame', threshold: 64, label: 'FORM', surface: 'nets' },
      { kind: 'highestSeniorTrust', threshold: 55, label: 'SENIOR TRUST', surface: 'dms' },
      { kind: 'meter', slot: 'heat', threshold: 60, label: 'FAME', surface: 'feed' },
    ],
    hardGate: true,
    hudTrustSource: 'highest-senior',
    lockCopy: 'Semi-final week. And the selectors are watching — India squad announcement is coming.',
    successBeat: 'Unknown number. "Beta, selectors ki meeting khatam hui. Pack your bags — India camp." THE CALL.',
    failBeat: 'Squad announced. Your name isn’t on it. Selectors ka message saaf hai: numbers complete karo, agli meeting tak.',
  },
]

// ── Lock clock ────────────────────────────────────────────────────────────────
export const DEFAULT_LOCK_MS = 24 * 60 * 60 * 1000 // 24h real-time per interlude

/** Parse a ?clock= override like "5m", "30s", "2h" → ms. Returns null if absent/bad. */
export function parseClockOverride(param: string | null): number | null {
  if (!param) return null
  const m = param.match(/^(\d+)(s|m|h)$/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  return m[2] === 's' ? n * 1000 : m[2] === 'm' ? n * 60_000 : n * 3_600_000
}

// ── Interlude activity caps (per interlude; reset when a week opens) ─────────
export const INTERLUDE_CAPS = {
  netSessions: 3,           // diminishing +4/+2/+1
  netGains: [4, 2, 1] as number[],
  trustMoments: 1,          // +4..+6
  chatTrustPerChar: 2,      // casual chat cap per character
  captionPosts: 1,          // spicy +3 Fame / safe +1 Fame
  commentReplies: 3,        // +1 Fame each
} as const

export interface InterludeState {
  netsUsed: number
  trustMomentUsed: boolean
  captionPosted: boolean
  repliesUsed: number
  /** Casual-chat trust earned this interlude, per character (for the +2 cap). */
  chatTrustEarned: Record<string, number>
}

export const FRESH_INTERLUDE: InterludeState = {
  netsUsed: 0,
  trustMomentUsed: false,
  captionPosted: false,
  repliesUsed: 0,
  chatTrustEarned: {},
}

// ── Nets micro-sessions (interlude Form grind) ───────────────────────────────
// 30-second scenes: one choice, threshold-gated narration. Form gain follows the
// diminishing schedule (netGains[netsUsed]); the risky option adds ±1 depending
// on whether current Form clears its threshold — same drill reads differently
// at Form 30 vs Form 55, which is the free replay variation.
export interface NetSession {
  id: string
  title: string
  scene: string
  safe: { label: string; note: string }
  risky: {
    label: string
    threshold: number
    pass: string
    fail: string
  }
}

export const NET_SESSIONS: NetSession[] = [
  {
    id: 'NET-BUMRAH',
    title: 'Nets with Bumrah',
    scene: 'Subah 7 baje. Wankhede nets. Bumrah apna run-up mark kar raha hai — woh wala spell jo match se pehle aata hai. Coach boundary pe khada hai, clipboard ready. "Chal, dikha kya seekha."',
    safe: { label: 'Respect the spell — leave the good ones, survive', note: 'Chhe ball. Teen leave, do block, ek punch through covers. Bumrah nod karta hai — "Theek hai. Defence ban rahi hai." Boring cricket, better player.' },
    risky: {
      label: 'Take him on — back yourself',
      threshold: 50,
      pass: 'Slower ball aati hai aur tum WAIT karte ho — late, under the eyes, lofted over mid-off. Bumrah ruk jaata hai mid run-up. "Accha. Yeh shot match mein bhi khelna." Coach clipboard pe kuch likhta hai.',
      fail: 'Pehli teen balls miss. Chautha — edge, off stump cartwheel. Bumrah kuch nahi bolta. Uska silence sab keh deta hai. Base banao pehle, phir attack.',
    },
  },
  {
    id: 'NET-THROWDOWNS',
    title: 'Throwdowns — the wet ball drill',
    scene: 'Shaam ke 6. Support staff ne bucket mein geeli balls rakhi hain — dew simulation. "Death overs mein yahi milegi," throwdown specialist bolta hai. "Ready?"',
    safe: { label: 'Groove the basics — straight bat, full face', note: 'Pachees minute, ek hi drill: watch, play late, full face. Haath sore, grip perfect. Specialist bolta hai — "Kal phir. Yeh roz ka kaam hai."' },
    risky: {
      label: 'Ask for the ramp + scoop set',
      threshold: 55,
      pass: 'Geeli ball, fine angle — aur tumhara ramp THIRD MAN ke upar. Specialist hassi nahi rok pata. "Kisko sikha raha hoon main?" Do aur perfect. Death-overs toolkit unlocked.',
      fail: 'Ramp try karte ho — ball glove leke helmet pe. Phir se. Phir se. Specialist bucket rakh deta hai: "Pehle base, phir circus." Fair hai.',
    },
  },
  {
    id: 'NET-FITNESS',
    title: 'Yo-yo test — fitness block',
    scene: 'Trainer beep test ke cones laga raha hai. Squad ka standard 17.1 hai. Tumhara last score? Recruitment file mein 16.4 likha hai. Seniors stretch karte hue dekh rahe hain.',
    safe: { label: 'Pace yourself — finish clean at your level', note: '16.6. Personal best. Trainer file update karta hai — "Improvement curve sahi hai. Consistency rakho." Building blocks.' },
    risky: {
      label: 'Chase the squad standard today',
      threshold: 52,
      pass: '17.1 — last shuttle pe lungs jal rahe hain par tum line cross karte ho. Trainer whistle bajaata hai. Do senior players clap karte hain. SQUAD STANDARD. File mein bold likha gaya.',
      fail: '16.8 pe legs give up. Trainer sympathetic hai — "Push accha tha, par abhi base chahiye." Limp karte hue cool-down. Kal phir.',
    },
  },
  {
    id: 'NET-RANGE',
    title: 'Range hitting — six o\'clock slot',
    scene: 'Raat ka optional slot. Sirf tum, ball machine, aur khali Wankhede. Floodlights half-power pe. Machine 140 pe set hai. Koi dekh nahi raha — sirf kaam.',
    safe: { label: 'Gap hitting — placement over power', note: 'Pachas balls, har ek ko gap mein. Glamorous nahi hai. Par scorebook mein chauke aur "dot ball" mein farak yahi drill hai.' },
    risky: {
      label: 'Clear the ropes — 20 ball six-hitting set',
      threshold: 58,
      pass: 'Solah out of twenty STANDS mein. Aakhri wali roof ke kareeb. Khali stadium mein echo hota hai. Security guard tak seeti bajaata hai. Power game: REAL.',
      fail: 'Top edges, miscues, ek ball machine pe wapas. Twenty mein se paanch clear. Timing power se pehle aati hai — aaj timing nahi thi.',
    },
  },
]

// ── Trust moments (interlude DM events) ──────────────────────────────────────
// Once per interlude, a senior opens something real in DMs. Respond well: +4-6
// trust. Respond badly: small dip. Reused across interludes like net drills.
export interface TrustMoment {
  charId: string
  opener: string
  replies: {
    label: string
    delta: number
    response: string
  }[]
}

export const TRUST_MOMENTS: TrustMoment[] = [
  {
    charId: 'rohit',
    opener: 'Aaj press ne phir wahi sawaal poocha — "Rohit ka time khatam ho raha hai kya?" 15 saal de diye is game ko. Kabhi kabhi lagta hai sab bhool jaate hain.',
    replies: [
      { label: 'Bhai, Wankhede aapke naam se bharta hai. Records baad mein, woh pehle.', delta: 5, response: 'Hmm. Sahi bola tu. Chal, kal nets pe aa — kuch sikhana hai tujhe jo press kabhi nahi samjhegi.' },
      { label: 'Haha time toh sabka khatam hota hai 😅', delta: -2, response: 'Wah. Tu bhi unhi mein se hai. Theek hai, beta.' },
    ],
  },
  {
    charId: 'hardik',
    opener: 'Bro ek baat bata. Jab main injured tha, sab bol rahe the "finished". Tu naya hai — tujhe kya lagta hai, comeback dikhta hai mujhme?',
    replies: [
      { label: 'Bhai maine aapki 2026 ki innings 10 baar dekhi hai. Comeback nahi — aap gone hi nahi the.', delta: 5, response: 'Bro. 🤜🤛 Yeh energy chahiye room mein. Kal gym saath karein?' },
      { label: 'Pata nahi bhai, selectors jaane', delta: -2, response: 'Selectors jaane? Bro main TUJHSE pooch raha tha. Forget it.' },
    ],
  },
  {
    charId: 'bumrah',
    opener: 'Spell khatam karke aaya hoon. 4 overs, 18 runs, 0 wickets. Sab "unlucky" bol rahe hain. Unlucky nahi tha — main slow tha. Koi maanta nahi jab main khud bolta hoon.',
    replies: [
      { label: 'Aapka release point 2cm neeche tha aaj. Wide yorker waala set chhodke seedha attack karte toh alag hota.', delta: 6, response: 'Tune... yeh notice kiya? Nets se? Interesting. Kal 7 baje aa. Hum dono kaam karenge.' },
      { label: 'Arre nahi bhai, unlucky hi the aap', delta: -1, response: 'Hmm. Theek hai. (read 11:42 pm)' },
    ],
  },
]

export function trustMomentFor(charId: string): TrustMoment | null {
  return TRUST_MOMENTS.find(m => m.charId === charId) ?? null
}

// ── Lookups ───────────────────────────────────────────────────────────────────
const idToWeek = new Map<string, number>()
SEASON_WEEKS.forEach(w => w.situationIds.forEach(id => idToWeek.set(id, w.week)))

/** Which week a situation id belongs to (1-based). */
export function weekForSituationId(id: string): number {
  return idToWeek.get(id) ?? 1
}

export function getWeek(week: number): SeasonWeek {
  return SEASON_WEEKS[Math.min(Math.max(week, 1), SEASON_WEEKS.length) - 1]
}

/** True if this queue index is the last beat of its week. */
export function isWeekEnd(queue: string[], index: number): boolean {
  const id = queue[index]
  if (!id) return false
  const w = weekForSituationId(id)
  const next = queue[index + 1]
  if (!next) return true // end of season
  return weekForSituationId(next) !== w
}

/** Map an in-flight save's queue index to the start index of its containing week. */
export function snapToWeekStart(queue: string[], index: number): { index: number; week: number } {
  const id = queue[Math.min(index, queue.length - 1)]
  const week = id ? weekForSituationId(id) : 1
  const startId = getWeek(week).situationIds[0]
  const startIdx = queue.indexOf(startId)
  return { index: startIdx >= 0 ? startIdx : 0, week }
}

// ── Gate evaluation ───────────────────────────────────────────────────────────
export interface GateGap {
  label: string
  current: number
  threshold: number
  surface: 'nets' | 'dms' | 'feed' | 'live'
  passed: boolean
}

export function evaluateGate(
  gate: GateRequirement[],
  meters: Meters,
  dmTrust: Record<string, number>,
): { passed: boolean; gaps: GateGap[] } {
  const gaps: GateGap[] = gate.map(req => {
    let current = 0
    if (req.kind === 'meter') current = meters[req.slot]
    else if (req.kind === 'charTrust') current = Math.round(dmTrust[req.charId] ?? 0)
    else current = Math.round(Math.max(0, ...SENIORS.map(s => dmTrust[s] ?? 0)))
    return {
      label: req.label,
      current,
      threshold: req.threshold,
      surface: req.surface,
      passed: current >= req.threshold,
    }
  })
  return { passed: gaps.every(g => g.passed), gaps }
}

/** Human pointer for the goal card: where to grind the first unmet requirement. */
export function surfaceHint(gap: GateGap): string {
  switch (gap.surface) {
    case 'nets': return 'Hit the nets to raise your Form'
    case 'dms':  return 'Earn it in DMs — talk to the seniors'
    case 'feed': return 'Work the feed — get India talking about you'
    default:     return 'Keep playing'
  }
}
