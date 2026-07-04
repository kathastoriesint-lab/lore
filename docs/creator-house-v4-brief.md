# Creator House v4 — authoring brief (14 beats)

The re-author. Two goals are the ONLY dials; every beat closes the loop
**Beat → Post/Feed → DM → next beat reads it back.** 4 characters. Eviction is
psychological (dread, never a real game-over).

## The two goals (the only meters)
- **FOLLOWERS** (`deltas.fame`) — survival / audience standing. The number the house is ranked by on Danger nights. Moves via your POSTS and how you play drama. Range per choice: **fame −3 … +4**. A "safe/game" choice trends fame up; a "real/heart" choice often costs a little fame.
- **CRUSH BOND** (`relationshipDeltas.<crush>`) — the romance. Moves in the crush's DM beats. Range per choice: **±2 … ±6**.
- **ALLY BOND** (`relationshipDeltas.<ally>`) — support; smaller swings (±1…±4). Not a headline goal but read on Danger night 2.

## The 4 characters (roles — each has ONE job)
| Char | Fixed? | Role | Voice |
|---|---|---|---|
| **Ria** (`ria`) | fixed | the **followers rival** — queen bee, 2.1M, image on borrowed money; poaches, undermines, competes for #1 | controlled, cutting, English-heavy Hinglish; compliments that land like warnings |
| **Zoya** (`zoya`) | fixed | the **heat engine** — sweet on camera, savage off; leaks, screenshots, deniable drama that threatens your followers | "hii babe" sweet on surface, sharp in private |
| **Crush** | `{crush}` = Ananya (♀ for male player) / Kabir (♂ for female player) | the **romance dial** + a follower lever via collabs; genuine, guarded, an unspoken almost-something | Ananya: warm, earnest, 🥺✨ · Kabir: street-Mumbai funny, deflects with a joke, soft only with you |
| **Ally** | `{ally}` = Kabir (♂) / Ananya (♀) | your **ride-or-die + a mirror** — helps you survive; their loyalty gets tested (tempted by content-over-you) | same-gender confidant, loyal, real |

**Dev is CUT — never appears.** Only these 4 NPCs exist.

## Tokens (author once, resolve by gender)
- `{name}` → player name · `{crush}` / `{ally}` → the swapped character name
- `{x|masc/fem}` → gendered word for the PLAYER (e.g. `{x|gaya/gayi}`) · `{p|masc/fem}` → gendered verb the CHARACTER uses about the player
- Crush/ally beats + the Danger-2 beat use these; Ria/Zoya beats name them directly.

## Beat schema (JSON, per situation)
```
{ id, day, slot, tag ("⚡ DAY N · TIME"), title, body[3 short paras],
  react:{char,text}(one-line preview), q (the choice question), reader:[{t:'nar'|'cue'|'img', ...}],
  choices:[  // exactly 2; each = ONE outcome: dm XOR post (feedReaction always adds a reaction)
    { t, s, deltas:{fame}, relationshipDeltas:{<char>:Δ}, dm:[{char,text}]  // OR:
      t, s, deltas:{fame}, relationshipDeltas:{...}, post:{source:'player',caption,reactions:[{char,text}]} } ],
  feedReaction:{ A:{char|account,caption}, B:{...} }  // the house/fans reacting to each choice
}
```
- `reader[]`: the cinematic scene — `nar` narration (max ~2 per tap), `cue` = a character line (avatar+text), a trailing `big` stake line headlines the choice splash. Match the CH v3 reader style.
- **ONE outcome per choice** (post XOR dm). The POST choices use the compose flow (`source:'player'` + caption + reactions). The DM choices fire the character's texts.
- Every beat's `feedReaction` = the house/fan-page reacting (natural, in-voice). Fan/gossip account handle = `housewatch_india` (never DMs).

## The 14 beats (the locked connectivity map)
Format: **id — title | choice A ▸ outcome | choice B ▸ outcome | feed | goal**

**CH1 · ARRIVAL**
- **D1-1 — Pehla Kadam** | A "Bold entrance" ▸ POST entrance reel (fame +3, exposed) | B "Read the room first" ▸ DM crush/Zoya first-contact (fame +1) | feed: house sizes you up | Followers
- **D1-2 — Pehli Reel** | A "Match Ria's energy" ▸ POST challenge reel (fame +3, Ria −2) | B "Your own lane" ▸ DM {ally} hype (fame +1, ally +3) | feed: Ria's camp vs fans | Followers
- **D1-3 — Terrace, Raat** | A "Open up" ▸ DM crush (crush +6, fame −1) | B "Play it cool" ▸ DM crush (crush −2, fame +1) | feed: (quiet) | Romance

**CH2 · THE GAME**
- **D2-1 — Zoya Ka Offer** | A "Play along" ▸ DM zoya (fame +2, owe her — flag) | B "Keep distance" ▸ DM zoya (fame −1, zoya −2) | feed: Zoya sweet | Followers
- **D2-2 — Ria, Camera Ke Saamne** | A "Take her collab" ▸ POST collab (fame +4, in Ria's debt — flag) | B "Decline" ▸ DM ria (fame −1, ria −3) | feed: reach vs independence | Followers
- **D2-3 — Pehli Danger Raat** | A "Vulnerable-real post" ▸ POST real content (fame +2 steady) | B "Big viral swing" ▸ POST risky content (fame +4 OR volatile) | feed: the vote chatter (your follower rank = the "audience read") | Followers · reads FAME as standing

**CH3 · THE HEAT**
- **D3-1 — {crush} Ka Collab** | A "Do it together" ▸ POST collab (fame +4, crush +4, target on you) | B "Protect your lane" ▸ DM crush (fame +1, crush −2) | feed: fans ship you / Ria cold | Both
- **D3-2 — Zoya Ka Hisaab** | A "Clap back public" ▸ POST clapback (fame volatile ±, drama) | B "Quiet control" ▸ DM {ally} (fame −1, defuse) | feed: the rumor + reactions | Followers
- **D3-3 — Do Dil, Do Raaste** | A "Choose the crush" ▸ DM crush (crush +6, fame −2) | B "Choose the game" ▸ DM crush (crush −3, fame +2) | feed: (private) | Romance (the pivot)

**CH4 · THE RECKONING**
- **D4-1 — Doosri Danger Raat** | A "Shield {ally}/{crush}" ▸ DM the-one-in-danger (fame −2, bond +5) | B "Protect yourself" ▸ POST self-preserving (fame +3, bond −3) | feed: personal vote chatter | Both · reads FAME + ally
- **D4-2 — {crush} Ka Faisla** | (crush chooses, keyed on prior crush bond) A "Meet them there" ▸ DM crush (crush +5) | B "Let it go" ▸ DM crush (crush −2, fame +1) | feed: — | Romance (resolves)
- **D4-3 — Ria, Bina Mask** | A "Expose her" ▸ POST exposé (fame +4, ruthless, bond −2) | B "Stay clean" ▸ DM {ally} (fame −1, dignity, ally +3) | feed: the narrative war | Both

**CH5 · THE FINALE**
- **D5-1 — Aakhri Bada Faisla** | THE swing (±). A "Play to WIN" ▸ POST (fame +6, crush −4) | B "Play for the ROMANCE" ▸ DM crush (crush +6, fame −4) | feed: finale-eve buzz | Both (sets ending)
- **D5-2 — Live Finale** | (the reveal — no big deltas) A "Own it" | B "Grateful" ▸ closing DM (crush + ally) | feed: the result | → ENDING

> Renumber cleanly if you prefer contiguous ids (D1-1..D5-2 = 14). Keep `day` = the chapter/day number.

## Endings (2×2 on FOLLOWERS × CRUSH BOND) — author 4 finale variants
- **Ghar Ki Rani/King** — followers high **AND** crush high: won the house + kept the love.
- **Feed Ki Rani** — followers high, crush low: you won #1, played everyone, leave alone.
- **Numbers Se Zyada** — followers lower, crush high: didn't top the board, walked out with something real.
- **Chaba Ke Thook Diya** — both low: the house used you; neither.
(Thresholds tuned in code: e.g. fame ≥ ~65 = "high standing"; crush bond ≥ ~60 = "the romance held".)

## Connectivity contract (the auditor enforces this)
1. Every beat: exactly 2 choices, each with EXACTLY ONE outcome (dm XOR post) + a `feedReaction` for both A/B.
2. Across the 14 beats: **≥6 POST choices** (the followers game must be playable — was only 2 in v3).
3. Every beat moves at least one goal (fame or crush/ally bond); no dead choices.
4. Crush arc lands across D1-3 → D3-3 → D4-2 → D5-1 (bond compounds to the ending).
5. Danger nights (D2-3, D4-1) frame FOLLOWERS as the audience standing.
6. Voices stay in character (Ria cutting, Zoya deniable-sweet, crush per gender, ally loyal). Roman-script Hinglish, natural not translated.
7. No Dev. No Meher/Rishi/Adi. Fan page = `housewatch_india` only.
