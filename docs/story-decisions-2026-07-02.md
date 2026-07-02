# Story Logic + Story Goals — CLOSED (July 2, 2026)

Session decisions (Nabh + Claude). These close the Notion items **Story logic** and
**Story goal** for cricket; Creator House inherits the frame after cricket is polished.

## 1. Overall story — LOCKED
- **Cricket:** Debut → Fall → Redemption. 14 beats / 3 match-weeks, weekly team-sheet
  ceremonies (started / benched / captain's-lifeline verdicts rewrite the following
  beats), 4 endings on Form × Captain's Trust × bench history. Shipped as cricket-v4.
- **Creator House:** unchanged for now — cricket first, CH gets the same treatment after.

## 2. Main goals — LOCKED (both worlds)
- **Cricket:** FORM (meter) + CAPTAIN'S TRUST (dmTrust.hardik) → India verdict.
- **Creator House:** FOLLOWERS (number) + CRUSH BOND (status tier) → finale.
- Thresholds tune after July-4 user testing; the FRAMES are final.

## 3. Pacing / beats-per-day — DECIDED: "Match Calendar"
- **1 match-week per real day** → a season is a 3-day habit loop.
- Next week unlocks **next morning 7am local** (diegetic: matches drop like real
  cricket), push notification at unlock.
- **Earn-a-skip:** completing the full engagement slate in a window (3 nets +
  2 DM conversations + the feed hook) unlocks the next week early — the most
  engaged players can go faster; everyone else gets the morning drop.
- **Story ≤ 50% of daily time.** The other half is the living layer: DMs, feed
  comment hooks, nets. Beats must get SHORTER (see §6).

## 4. Side / day-level goal — DECIDED: one loud objective per window
- Every selection window surfaces ONE specific chase on the goal card, state-aware:
  e.g. "Hardik ko 46 tak le jao — Wednesday ki sheet ke liye" (captain gap binding)
  or "Form 56 chahiye — nets ya runs" (form gap binding). Deadline-flavored, always
  visible. This is the "what do I do NOW" answer.

## 5. DM layer — DECIDED: story-connected, plus the evening companion
- **Generic trust-moments are OUT** (the canned "Rohit ka time khatam ho raha hai"
  opener felt disconnected). Every DM trigger must reference the actual story state.
- **Evening companion chat (new):** after a day's beats end, 2 characters reach out
  organically for open-ended hangout chat —
  - **Maddy (best friend)** pings daily: the emotional anchor.
  - **1 contextual senior** picked by the day's events (great knock → Bumrah;
    benched → Tilak; media storm → Rohit; selection eve → Hardik).
  - Openers are **authored per beat-outcome** (reference what just happened);
    the free-form AI chat continues from there (already live via lore-chat).
  - This is the AI-companion layer: talk to your world after the day is over.

## 6. Beat format — DECIDED: lighter, more visual
- Current beats are cognitively heavy. New bar per beat:
  - **~2 photos per beat** (scene images inside the reader; library exists).
  - **Shorter lines** — tighten every nar/cue without losing the essence;
    target nar ≤ ~18 words, cue ≤ ~22, ≤ 8 blocks per beat incl. images.
  - Keep the one `big` stakes line.

## Build list (in order)
1. Beat-lightening content pass: tighten all 14 beats + add 2nd images.
2. Match calendar: `weekUnlockAt` + morning-drop gate + earn-a-skip meter + push hook.
3. Evening companion: authored context openers per beat-outcome + evening ping scheduler.
4. Loud objective line on GoalCard (state-aware copy).
5. Trust-moment rework: kill generic openers; fold into (3).
