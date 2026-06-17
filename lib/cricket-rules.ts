// Pure cricket rules — no content data. Kept separate from lib/cricket-data.ts
// (now content-only, served as JSON) so that module stays OUT of the client
// bundle. These functions are deterministic and isomorphic: they could run
// unchanged in a server/edge handler later (eng-review finding 1 + Phase-1 1d).
import type { Meters } from './types'

export type CricketEnding =
  | 'realDeal' | 'captainsProject' | 'paltanWonderkid' | 'tooMuchTooSoon' | 'quietClimber'

// Slot mapping: fame=Form 🏏, heat=Fame ⭐, image=Team Trust 🤝.
// Priority order keeps exactly one final ending even when a path has mixed signals.
export function resolveCricketEnding(m: Meters): CricketEnding {
  // Too Much Too Soon: public Fame outruns cricket credibility and dressing-room trust.
  if (m.heat >= 54 && m.image < 26 && m.fame < 68) return 'tooMuchTooSoon'
  // Paltan Wonderkid: public Fame clearly outruns dressing-room Trust.
  if (m.heat >= 53 && m.heat >= m.image + 14) return 'paltanWonderkid'
  // Captain's Project: Trust is strong enough that the dressing room backs the project.
  if (m.image >= 38 && m.image >= m.heat - 8 && m.image >= m.fame - 35) return 'captainsProject'
  // Real Deal: Form is the dominant meter (cricket credibility wins).
  if (m.fame >= 70 && m.fame >= m.heat + 14 && m.fame >= m.image + 28) return 'realDeal'
  return 'quietClimber'
}
