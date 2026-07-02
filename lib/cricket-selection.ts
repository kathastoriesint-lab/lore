// Cricket — weekly squad selection. The heartbeat of the season: every match
// week ends with a team sheet, and FORM + CAPTAIN'S TRUST decide whether you
// START, get the captain's LIFELINE (his trust covers your form), or sit
// BENCHED (variant beats — dugout POV, politics, a path back in).
//
// Built on the EvictionScreen ceremony pattern (lib/creator-house.ts): a
// non-Situation full-screen ceremony resolved from game state, then persisted
// into game.selections so beat variants + the feed replay stay deterministic.
//
// Voice: roman-Hinglish, dressing-room real.
import type { CharId, GameState, SelectionVerdict } from './types'

// ── Captain's Trust — the second headline goal ───────────────────────────────
const CAPTAIN_ID = 'hardik'
const CAPTAIN_TRUST_START = 30

/** The Captain's Trust goal value (dmTrust['hardik'], rounded). */
export function captainTrust(dmTrust: Record<string, number> | undefined): number {
  return Math.round(dmTrust?.[CAPTAIN_ID] ?? CAPTAIN_TRUST_START)
}

/** Display tier for the Captain's Trust goal (Profile / HUD). */
export function captainTier(t: number): string {
  if (t < 30) return 'Sceptical'
  if (t < 45) return 'Watching'
  if (t < 60) return 'Backing you'
  return 'Vouching'
}

// ── Selection rules ──────────────────────────────────────────────────────────
export interface SelectionRule {
  week: number
  /** START: form ≥ start.form AND captain ≥ start.captain */
  start: { form: number; captain: number }
  /** LIFELINE: form ≥ lifeline.formMin AND captain ≥ lifeline.captain (captain
   *  stakes his name on you despite the form shortfall). */
  lifeline: { formMin: number; captain: number }
  /** W3 only — RECALL: benched at W2 but form ≥ recallForm forces the door open. */
  recallForm?: number
}

// Tuning intent (starts: form 40 · hardik 30; nets +4/+2/+1 per window; DM chat
// +2/char capped; trust moments +4–6): W1 winnable on story+nets alone; W2 fails
// form-only players on the captain bar (the lesson); W3 demands both.
export const SELECTION_RULES: SelectionRule[] = [
  { week: 1, start: { form: 48, captain: 34 }, lifeline: { formMin: 42, captain: 42 } },
  { week: 2, start: { form: 56, captain: 46 }, lifeline: { formMin: 48, captain: 56 } },
  { week: 3, start: { form: 62, captain: 55 }, lifeline: { formMin: 50, captain: 62 }, recallForm: 64 },
]

/** Beat whose completion opens each selection window (ceremony plays before the
 *  NEXT beat — the verdict-variant beat). */
export const SELECTION_TRIGGERS: Record<string, string> = {
  'CR2-S4': 'SEL-W1',
  'CR2-S9': 'SEL-W2',
  'CR2-S12': 'SEL-W3',
}

export const selectionWeek = (selId: string): number => Number(selId.replace('SEL-W', '')) || 1

export function ruleFor(week: number): SelectionRule {
  return SELECTION_RULES.find(r => r.week === week) ?? SELECTION_RULES[SELECTION_RULES.length - 1]
}

/** Resolve the squad verdict. W3: a player benched at W2 who ground form to the
 *  recall bar forces their way back in ('started' — the ceremony copy calls out
 *  the recall; resolveSelection also sets flags.recalled for variants). */
export function resolveSelectionVerdict(
  week: number,
  form: number,
  captain: number,
  benchedWeeks: number[] = [],
): SelectionVerdict {
  const rule = ruleFor(week)
  if (rule.recallForm !== undefined && benchedWeeks.includes(2) && form >= rule.recallForm) return 'started'
  if (form >= rule.start.form && captain >= rule.start.captain) return 'started'
  if (form >= rule.lifeline.formMin && captain >= rule.lifeline.captain) return 'lifeline'
  return 'benched'
}

/** True when this W3 'started' verdict was the recall path (for copy + flag). */
export function isRecall(week: number, form: number, captain: number, benchedWeeks: number[] = []): boolean {
  const rule = ruleFor(week)
  if (rule.recallForm === undefined || !benchedWeeks.includes(2) || form < rule.recallForm) return false
  // It's a "recall" story only if the normal START bar wasn't cleanly met.
  return !(form >= rule.start.form && captain >= rule.start.captain)
}

/** Beats until the next squad announcement (inclusive of the current beat).
 *  Returns null when no selection remains ahead of `index`. */
export function beatsToAnnouncement(queue: string[], index: number): number | null {
  for (let i = index; i < queue.length; i++) {
    if (SELECTION_TRIGGERS[queue[i]]) return i - index + 1
  }
  return null
}

/** DM-goal threshold for a senior (keeps the DM thread goal card honest):
 *  the captain's bar for the CURRENT selection window. */
export function trustGateThreshold(charId: string, week = 1): number | null {
  if (charId !== CAPTAIN_ID) return null
  const rule = ruleFor(week)
  return rule.start.captain
}

// ── Ceremony payload ─────────────────────────────────────────────────────────
export interface SelectionNight {
  id: string
  week: number
  verdict: SelectionVerdict
  recall: boolean
  matchLabel: string
  intro: string
  /** Team sheet reveal — a few names, then the moment of truth. */
  teamSheet: { name: string; you?: boolean }[]
  captainLine: string
  coachLine: string
  aftermath: string
  readout: { form: number; formNeed: number; captain: number; captainNeed: number; captainLifeline: number }
}

const MATCH_LABELS: Record<number, string> = {
  1: 'MI vs CSK · Wankhede · Debut XI',
  2: 'MI vs RCB · Away',
  3: 'ELIMINATOR · MI vs GT',
}

// A believable MI-ish sheet; your slot is #5 (the role Hardik set).
const XI_TOP = ['Rohit Sharma', 'Ishan Kishan', 'Suryakumar Yadav', 'Tilak Varma']

export function buildSelection(id: string, game: GameState, dmTrust: Record<string, number> | undefined): SelectionNight | null {
  const week = selectionWeek(id)
  const rule = ruleFor(week)
  const form = Math.round((game.meters as { form?: number }).form ?? 40)
  const captain = captainTrust(dmTrust)
  const benched = game.benchedWeeks ?? []
  const verdict = resolveSelectionVerdict(week, form, captain, benched)
  const recall = isRecall(week, form, captain, benched)

  const you = game.playerName || 'Tum'
  const rival = 'Naman Dhir'
  const fifth = verdict === 'benched' ? { name: rival } : { name: you, you: true }
  const teamSheet = [...XI_TOP.map(name => ({ name })), fifth]

  const intro = {
    1: 'Team sheet raat ko lagti hai. Corridor khaali hai. Do naam ek slot — tum, ya Naman.',
    2: 'Selection meeting. Mahela ke saamne form sheet, Hardik ke saamne kuch aur. Darwaza bandh hota hai.',
    3: 'Eliminator. Jeeto ya ghar jao. XI subah announce hogi — aur selectors stand mein honge.',
  }[week] ?? 'Team sheet drops now.'

  const captainLine =
    verdict === 'started' && recall ? `Bench pe baith ke ${form} tak form le gaya. Yeh main ignore nahi kar sakta. Wapas aa.` :
    verdict === 'started' ? 'Kaam bola tha, kaam dikha. Khelega.' :
    verdict === 'lifeline' ? 'Numbers poore nahi hain. Par main hoon. Mera call — yeh khelega. Galat mat nikalna.' :
    captain >= 40 ? 'Abhi nahi. Par main dekh raha hoon — jo bench pe karta hai woh bhi selection hota hai.' :
    'Form sheet ne bol diya. Mere paas add karne ko kuch nahi tha.'

  const coachLine =
    verdict === 'started' ? `Form ${form}. Sheet ne khud naam likha.` :
    verdict === 'lifeline' ? `Sheet ${rule.start.form} maangti thi, tumhare paas ${form} tha. Captain ne apna naam laga diya. Ab yeh uska risk hai.` :
    `Form ${form}, zaroorat ${rule.start.form}. Ya captain ka bharosa ${rule.lifeline.captain} — woh bhi nahi tha. Kaam karo.`

  const aftermath =
    verdict === 'started' && recall ? 'Recall. Ghar mein sab jaante hain yeh kaise hua — nets se, chup-chaap. Ab prove karo yeh one-off nahi tha.' :
    verdict === 'started' ? 'Naam sheet pe hai. Ab sheet se bahar ki duniya shuru hoti hai.' :
    verdict === 'lifeline' ? 'Captain ne tumhare liye apni credibility kharch ki. Yeh karz hai — aur poora ghar dekh raha hai.' :
    `${rival} khelega. Tum drinks le jaoge. Jo is hafte bench pe karoge — wohi agli sheet decide karega.`

  return {
    id, week, verdict, recall,
    matchLabel: MATCH_LABELS[week] ?? `Match Week ${week}`,
    intro, teamSheet, captainLine, coachLine, aftermath,
    readout: { form, formNeed: rule.start.form, captain, captainNeed: rule.start.captain, captainLifeline: rule.lifeline.captain },
  }
}
