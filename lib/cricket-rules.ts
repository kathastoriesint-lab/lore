// Pure cricket rules — no content data. Kept separate from lib/cricket-data.ts
// (content-only, served as JSON) so that module stays OUT of the client bundle.
// These functions are deterministic and isomorphic.

export type CricketEnding = 'indiaCall' | 'captainsBet' | 'statsMachine' | 'notYet'

/**
 * Season verdict — the India A / T20I announcement, decided by the two visible
 * goals: FORM (runs on the board) and CAPTAIN'S TRUST (dmTrust['hardik']), with
 * your bench history following you (you can't make a national squad off a season
 * you mostly watched — unless the captain stakes everything on you).
 *
 *   indiaCall    — form ≥ 66 AND captain ≥ 55 AND benched ≤ 1 (runs AND the room)
 *   captainsBet  — captain carried you: ≥ 55 with playable form, or ≥ 60 despite the bench
 *   statsMachine — form ≥ 66 but the room stayed cold (captain < 55)
 *   notYet       — everything else; forced when benched twice without the captain (< 60)
 */
export function resolveCricketEnding(form: number, captain: number, benched = 0): CricketEnding {
  // Rescaled for the choices-only form economy (nets removed Jul 4):
  // best-play final form ≈ 60-63, neglect ≈ 39-42.
  if (benched >= 2 && captain < 60) return 'notYet'
  if (form >= 58 && captain >= 55 && benched <= 1) return 'indiaCall'
  if (captain >= 55 && (form >= 48 || captain >= 60)) return 'captainsBet'
  if (form >= 58) return 'statsMachine'
  return 'notYet'
}
