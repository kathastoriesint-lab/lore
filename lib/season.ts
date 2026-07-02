// Season structure for the cricket world (Indian Dressing Room) — v2.
//
// 14 beats (CR2-S1..S14) across 3 Match Weeks. FREE-FLOW: no real-time locks.
// Each week's last regular beat triggers a SELECTION window (lib/cricket-selection):
// the player may grind (nets/DMs/feed — capped per window) and then taps into the
// squad-announcement ceremony. The verdict variant-keys the next beat.
//
// Two goals: FORM (meters.form) + CAPTAIN'S TRUST (dmTrust['hardik']).

export const SENIORS = ['rohit', 'hardik', 'bumrah', 'surya'] as const

export interface SeasonWeek {
  week: number
  name: string
  /** Situation ids belonging to this week, in queue order. */
  situationIds: string[]
}

export const SEASON_WEEKS: SeasonWeek[] = [
  { week: 1, name: 'Arrival',       situationIds: ['CR2-S1', 'CR2-S2', 'CR2-S3', 'CR2-S4', 'CR2-S5'] },
  { week: 2, name: 'The Debut',     situationIds: ['CR2-S6', 'CR2-S7', 'CR2-S8', 'CR2-S9', 'CR2-S10'] },
  { week: 3, name: 'The Reckoning', situationIds: ['CR2-S11', 'CR2-S12', 'CR2-S13', 'CR2-S14'] },
]

// ── DM economy ───────────────────────────────────────────────────────────────
// DMs are open all season (no interlude gating). Free-chat allowance per senior
// per real day — keeps threads alive daily without infinite grinding. Mission /
// story-injected exchanges don't consume it. v1-tunable.
export const DM_DAILY_BUDGET = 10

// ── Grind caps (per selection window; reset when a window opens) ─────────────
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
