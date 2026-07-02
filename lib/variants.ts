// Beat-variant resolution — the story reacting to your state.
//
// A Situation may carry `variants[]` (alternate versions keyed on the week's
// selection verdict, a senior's trust band, a story flag, or a persisted gate
// result) and its reader blocks may carry `when` (conditional tone lines).
// This module resolves them in ONE place so LiveScreen, makeChoice, and the
// feed replay all render the exact same beat.
//
// REPLAY SAFETY: dmTrust (and evolving flags) are not reconstructable when the
// feed replays an old run, so makeChoice PERSISTS the active variant index in
// game.variantSeen (and gate outcomes in game.gateResults). Replay re-applies
// the same variant by index instead of re-evaluating conditions.
import type { Choice, ChoiceOutcome, CricketMeters, GameFlags, GameState, Meters, SelectionVerdict, Situation, VariantCond } from './types'

export interface VariantCtx {
  /** Verdict that opened this situation's week (from persisted game.selections). */
  weekVerdict?: SelectionVerdict
  dmTrust: Record<string, number>
  flags: GameFlags
  /** Persisted outcomeGate results (for `gate` conditions). */
  gateResults?: Record<string, 'pass' | 'fail'>
}

/** Does a condition match the current context? All specified keys must hold. */
export function matchCond(c: VariantCond, ctx: VariantCtx): boolean {
  if (c.benched !== undefined && (ctx.weekVerdict === 'benched') !== c.benched) return false
  if (c.started !== undefined) {
    const playing = ctx.weekVerdict === 'started' || ctx.weekVerdict === 'lifeline'
    if (playing !== c.started) return false
  }
  if (c.lifeline !== undefined && (ctx.weekVerdict === 'lifeline') !== c.lifeline) return false
  if (c.charTrust) {
    const t = ctx.dmTrust[c.charTrust.charId]
    if (t === undefined) return false
    if (c.charTrust.gte !== undefined && !(t >= c.charTrust.gte)) return false
    if (c.charTrust.lt !== undefined && !(t < c.charTrust.lt)) return false
  }
  if (c.flag && !((ctx.flags[c.flag.key] ?? 0) >= c.flag.gte)) return false
  if (c.gate && ctx.gateResults?.[c.gate.sitId] !== c.gate.is) return false
  return true
}

/** Index of the first matching variant, or -1 for the base beat. */
export function resolveVariantIndex(sit: Situation, ctx: VariantCtx): number {
  if (!sit.variants?.length) return -1
  const i = sit.variants.findIndex(v => matchCond(v.when, ctx))
  return i
}

/** Overlay a variant (by index) onto the base beat. -1 / out of range = base. */
export function applyVariant(sit: Situation, index: number): Situation {
  const variant = index >= 0 ? sit.variants?.[index] : undefined
  if (!variant) return sit
  return {
    ...sit,
    ...(variant.title !== undefined ? { title: variant.title } : {}),
    ...(variant.tag !== undefined ? { tag: variant.tag } : {}),
    ...(variant.q !== undefined ? { q: variant.q } : {}),
    ...(variant.reader !== undefined ? { reader: variant.reader } : {}),
    ...(variant.choices !== undefined ? { choices: variant.choices } : {}),
  }
}

/** Resolve a situation against the live context: first matching variant overlay,
 *  then conditional reader-line filtering. Pure and deterministic. */
export function resolveSituationVariant(sit: Situation, ctx: VariantCtx): Situation {
  let out = applyVariant(sit, resolveVariantIndex(sit, ctx))
  if (out.reader?.some(b => b.when)) {
    out = { ...out, reader: out.reader!.filter(b => !b.when || matchCond(b.when, ctx)) }
  }
  return out
}

/** Replay-safe resolution: re-apply the PERSISTED variant (game.variantSeen);
 *  fall back to live resolution only when the beat hasn't been chosen yet.
 *  Conditional reader lines are display-only, so live filtering is fine. */
export function resolveSituationForReplay(sit: Situation, game: Pick<GameState, 'variantSeen'>, ctx: VariantCtx): Situation {
  const seen = game.variantSeen?.[sit.id]
  if (seen !== undefined) {
    let out = applyVariant(sit, seen)
    if (out.reader?.some(b => b.when)) {
      out = { ...out, reader: out.reader!.filter(b => !b.when || matchCond(b.when, ctx)) }
    }
    return out
  }
  return resolveSituationVariant(sit, ctx)
}

/** Resolve a choice's outcomeGate. Reads form/fame from the meters or a senior's
 *  dmTrust ('charTrust' — the DM-payoff gates), applies trust ASSISTS (DM
 *  engagement lowering the bar), and prefers a PERSISTED result when replaying
 *  (dmTrust drifts; the stored verdict is ground truth). Returns null = no gate. */
export function resolveGateOutcome(
  choice: Choice,
  meters: Meters,
  dmTrust: Record<string, number>,
  persisted?: Record<string, 'pass' | 'fail'>,
  sitId?: string,
): { outcome: ChoiceOutcome; result: 'pass' | 'fail' } | null {
  const gate = choice.outcomeGate
  if (!gate) return null
  const stored = sitId ? persisted?.[sitId] : undefined
  if (stored) return { outcome: stored === 'pass' ? gate.pass : gate.fail, result: stored }
  let threshold = gate.threshold
  for (const a of gate.assists ?? []) {
    if ((dmTrust[a.charId] ?? 0) >= a.min) threshold += a.thresholdDelta
  }
  const value = gate.metric === 'charTrust'
    ? Math.round(dmTrust[gate.charId ?? ''] ?? 0)
    : ((meters as CricketMeters)[gate.metric] ?? 0)
  const result: 'pass' | 'fail' = value >= threshold ? 'pass' : 'fail'
  return { outcome: result === 'pass' ? gate.pass : gate.fail, result }
}

/** Build the variant context for a situation from game state. The week verdict
 *  comes from the persisted selection whose ceremony opened this beat's week. */
export function variantCtxFor(
  game: Pick<GameState, 'selections' | 'flags' | 'gateResults'>,
  dmTrust: Record<string, number>,
  week?: number,
): VariantCtx {
  // The verdict governing a beat is the LATEST resolved selection at or before
  // its week: mid-week-2 beats (debut match) run on SEL-W1's verdict; once
  // SEL-W2 resolves, week-2's tail + week-3's head read it, and so on.
  let weekVerdict: SelectionVerdict | undefined
  if (week !== undefined) {
    for (let w = week; w >= 1 && weekVerdict === undefined; w--) {
      weekVerdict = game.selections?.[`SEL-W${w}`]
    }
  }
  return { weekVerdict, dmTrust, flags: game.flags, gateResults: game.gateResults }
}
