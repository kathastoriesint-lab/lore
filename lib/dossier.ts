// Character dossiers for Creator House — the deep "bible" layer (reference).
// Source: worlds/creator-house.md §6. Persona/wants always visible; the truth and the
// secret unlock as your bond grows. Living relationship/history gets established in DMs
// (see DMThreadScreen context header) — this is the reference, the DMs are the feeling.
//
// Voice: roman-Hinglish with FLAVOUR — gossip energy, the way a 22-year-old would spill
// tea about these people, not a bio. Hindi carries the sentence; English nouns drop in.

import type { CharId } from './types'

export interface DossierTie {
  charId: CharId
  label: string          // RIVAL · ALLY · PROTECTS · USING · FRENEMY (chip — short)
  color: 'heat' | 'trust' | 'fame' | 'ink3'
  note: string
}

export interface Dossier {
  tagline: string                // one-line who-they-are
  persona: string                // public face — always visible
  wants: string                  // always visible
  fears: string                  // unlocks at bond >= TRUTH_BOND
  truth: string                  // private truth — unlocks at bond >= TRUTH_BOND
  secret: string                 // the receipts — unlocks at bond >= SECRET_BOND
  ties: DossierTie[]             // the feud map — always visible
}

export const TRUTH_BOND = 45      // "mask ke peeche dekh liya"
export const SECRET_BOND = 68     // "ab woh tujhpe sach ke saath bharosa karte hain"

export const DOSSIERS: Partial<Record<CharId, Dossier>> = {
  ria: {
    tagline: 'Ghar ki queen bee. Sabse upar baithi rehti hai — aur use yeh baat achhe se pata hai.',
    persona: '"Main clean hoon, classy hoon" — poora vibe yahi hai. Untouchable type. Sab apne aap ko usi se compare karte hain.',
    wants: 'Kisi badi luxury brand ki ambassador ban-na — taaki yeh poora rich-girl act finally sach lage.',
    fears: 'Pol khul jaana. Ki yeh sab dikhawa hai. Ek dhakka aur poora image taash ke patton ki tarah gir jaaye.',
    truth: 'Yeh "old money" wala scene? Pura udhaar pe chal raha hai. Jo paisa dikhati hai, woh hai hi nahi uske paas.',
    secret: 'Shoot ke baad mehenge kapde chup-chaap wapas kar deti hai — return karke paisa wapas. Aur iske screenshots kisi ke paas hain.',
    ties: [
      { charId: 'kabir', label: 'RIVAL', color: 'heat', note: 'Ek brand deal jo Ria apni maan ke baithi thi — Kabir ne beech mein kaat di. Tab se thani hui hai.' },
      { charId: 'zoya', label: 'FRENEMY', color: 'heat', note: 'Upar se "hii babe", andar se ek doosre ko nigalne ko taiyaar.' },
      { charId: 'ananya', label: 'DISMISSES', color: 'ink3', note: '"Bas thumkewaali hai" bol ke ginti mein hi nahi leti.' },
      { charId: 'dev', label: 'ALLY (FRAGILE)', color: 'fame', note: 'Dosti kam, deal zyada. Jab tak dono ka faayda hai, tab tak saath.' },
    ],
  },
  kabir: {
    tagline: 'Sabka yaar, kisi ka nahi. Hasi ke peeche kuch aur hi chal raha hai.',
    persona: '"Main toh bas vibes, bro" wala banda. Har kisi ko ek joke maar ke apna bana leta hai.',
    wants: 'Is poore ghar ka main character ban-na. Bas uski kahani chale.',
    fears: 'Log samajh jaayein ki asli villain wahi hai.',
    truth: 'Doosron ki ladaaiyan woh khud set karta hai — drama hi uska best content hai. Aur sabke screenshots backup mein rakhta hai.',
    secret: 'Ghar ki sabse pehli rumor? Woh khud leak ki thi. Naam chhupa ke. Phir aaram se baith ke tamasha dekha.',
    ties: [
      { charId: 'ria', label: 'RIVAL', color: 'heat', note: 'Brand deal sabotage ke baad se dono ke beech khuli jung.' },
      { charId: 'dev', label: 'DUO (USING)', color: 'fame', note: 'Camera pe comedy jodi, peeche dono ek doosre ko use kar rahe hain.' },
      { charId: 'ananya', label: 'MANIPULATES', color: 'heat', note: 'Ananya samajhti hai woh uska dost hai. Use kar raha hai usko.' },
    ],
  },
  ananya: {
    tagline: 'Ghar ki sabse seedhi. Jo dikhti hai wahi hai — aur yahi uski kamzori hai.',
    persona: 'Pyaari, bubbly, woh viral dancer jo Reels pe raat-o-raat chha gayi.',
    wants: 'Log usse ek "real" creator maanein — sirf "ek dancer" nahi.',
    fears: 'Jin pe bharosa kiya, wahi use karke phenk dein.',
    truth: 'In games mein woh apni depth se zyada gehri utar gayi hai — aur use pata hai. Smile sachi hai, andar ka darr bhi.',
    secret: 'Na koi chaal, na koi screenshot. Yahi total bhola-pan use sabse aasaan shikaar bana deta hai.',
    ties: [
      { charId: 'ria', label: 'HURT BY', color: 'ink3', note: 'Ria ka "thumkewaali" wala taana seedha dil pe lag gaya.' },
      { charId: 'kabir', label: 'USED BY', color: 'heat', note: 'Uspe aankh band karke bharosa karti hai. Karna nahi chahiye.' },
    ],
  },
  dev: {
    tagline: 'Pura sellout. Loyalty bhi uske liye ek deal hi hai.',
    persona: 'Discipline, motivation, brand pe brand. "5 baje uthe? Nahi? Tabhi toh peeche ho."',
    wants: 'Ghar khatam hone se pehle sabse zyada brand ka paisa jod lena.',
    fears: 'Log usse bas ek "dumb gym bro" samjhein jo luck se chal gaya.',
    truth: 'Jo zyada clout de, usi ke saath chala jaata hai. Aur strategy itni padhi hai jitna koi sochta bhi nahi.',
    secret: 'Ek supplement brand fail ho gaya tha — uska chup-chaap karza chadha hai. Yahan har deal us gadde se nikalne ki koshish hai.',
    ties: [
      { charId: 'ria', label: 'ALLY', color: 'fame', note: 'Faayde ka rishta. Jab tak clout mil raha hai, tab tak.' },
      { charId: 'kabir', label: 'USING', color: 'fame', note: 'Camera pe comedy duo, peeche ek doosre ko taad rahe hain.' },
    ],
  },
  zoya: {
    tagline: 'Camera on: "hii babies 🥰". Camera off: chaaku.',
    persona: 'Beauty / GRWM wali. Meethi, soft, screen pe sabko pyaari lagti hai.',
    wants: 'Ghar ki beauty queen ban-na aur har rival ko peeche chhod dena.',
    fears: 'Woh pyaari image kho dena jiske peeche saari cruelty chhup jaati hai.',
    truth: 'Camera band, sweetness gaayab. "Usko smile ke peeche kaat dungi."',
    secret: 'Rivals ki bekaar photos leak karti hai aur baaki kaam fan pages se karwa leti hai. Ria ki ek photo abhi uske paas hai — locked aur loaded.',
    ties: [
      { charId: 'ria', label: 'FRENEMY', color: 'heat', note: 'Wahi rivalry jo poore ghar ki gossip chalati hai.' },
    ],
  },
}
