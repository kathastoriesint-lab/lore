// Evening companion — the AI-companion layer.
//
// When a match-week's story ends (the calendar sets "agla match kal subah"),
// the world reaches out: Maddy (best friend, the daily emotional anchor) plus
// ONE senior picked by what actually happened that day. Openers are AUTHORED
// per outcome so they reference the player's real day — never canned. The
// free-form AI chat continues from there (lore-chat), which is where trust
// grows (chat cap per window in INTERLUDE_CAPS).
//
// This replaced the generic TRUST_MOMENTS ("Rohit ka time khatam…") that fired
// with zero story context.
import type { CharId, GameState, SelectionVerdict } from './types'

export interface EveningPing { char: CharId; text: string }

const v = (x: SelectionVerdict | undefined) => x ?? 'started'

/** Pings for the evening after `finishedWeek`'s story ended. Deterministic. */
export function buildEveningPings(finishedWeek: number, game: GameState): EveningPing[] {
  const verdict = v(game.selections?.[`SEL-W${finishedWeek}`])
  const gate7 = game.gateResults?.['CR2-S7']
  const pings: EveningPing[] = []

  if (finishedWeek === 1) {
    // Day 1 evening — the team sheet just decided your debut.
    pings.push({
      char: 'friend',
      text: verdict === 'benched'
        ? 'Bro maine sheet dekhi. Tu theek hai? Seriously — school waale din yaad kar, tab bhi pehli baar mein nahi hua tha. Call karun?'
        : verdict === 'lifeline'
          ? 'BHAI. Captain ne KHUD tera naam daala?? Mummy ko maine hi bataya, ro rahi hai (happy waala). Kal TV pe TU hoga 😭'
          : 'TEAM SHEET PE TERA NAAM HAI. Screenshot le liya maine. Kal ki tayari kya hai — neend aayegi bhi?',
    })
    pings.push(
      verdict === 'benched'
        ? { char: 'tilak', text: 'Bench pe pehla hafta sabka aata hai bhai. Mera bhi aaya tha. Farak yeh hai ki tu us hafte kya karta hai. Kal nets mein aa raha hai?' }
        : verdict === 'lifeline'
          ? { char: 'hardik', text: 'Kal sab kuch bolenge — commentary, timeline, sab. Tu sirf ek kaam kar: khel. Baaki main dekh lunga.' }
          : { char: 'bumrah', text: 'Kal ke liye ek cheez yaad rakh — unka left-armer pehli do ball cross-seam daalta hai. Dekh ke. Phir apna game.' },
    )
  } else if (finishedWeek === 2) {
    // Day 2 evening — debut/knock + the leak week just ended.
    pings.push({
      char: 'friend',
      text: gate7 === 'pass'
        ? 'Poora mohalla tera clip bhej raha hai ek doosre ko. MERA best friend. Bata kaisa laga crease pe — sach mein, TV waala nahi.'
        : verdict === 'benched'
          ? 'Aaj ka mat soch. Ek hafta hai abhi. Aur sun — jo bhi timeline pe chal raha hai, main tere saath hoon. Hamesha. 🤜🤛'
          : 'Aaj raat phone side pe rakh de yaar. Score kal bhi wahi rahega, tu naya hoga. Bata — khaana khaya?',
    })
    pings.push(
      gate7 === 'pass'
        ? { char: 'rohit', text: 'Achhi pari ke baad ki raat sabse dangerous hoti hai. Aaj celebrate kar, kal bhool ja. Asli player woh hai jo dono kar sake.' }
        : { char: 'rohit', text: 'Kal subah 6 baje nets. Bina phone ke aa. Jo kal hua woh gend ka tha, tera nahi — farak samajhna zaroori hai.' },
    )
  }
  // Week 3 has no evening after it — the season ends at the verdict.
  return pings
}
