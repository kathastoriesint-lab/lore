# Creator House — "Make It True" (CEO review outcome)

## Context
A `/plan-ceo-review` of the shipped **Creator House** world found that what the world
*promises* and what it *plays* have drifted apart. It is sold as a 4-ending strategic
survival reality show; it actually plays as a 1-ending walk whose survival threat
contradicts its own design bible, with the only rule that matters (Trust = safety)
never taught. Mode selected: **HOLD SCOPE** — make the existing promise true before
adding anything. No expansions.

Source of truth: `docs/creator-house-world-bible-v2.md`, `docs/creator-house-v2-outcome-report.md`,
`lib/creator-house.ts`, `lib/game.ts`, and the shared screens (`components/screens/*`).

## Decisions (from the review)
- **D1 Posture:** HOLD SCOPE — fix the core so the current promise works.
- **D2 Stakes:** **Psychological only.** The player is never actually evicted; they always
  reach the finale (matches the bible). The eviction-risk HUD becomes *audience pressure /
  nomination drama*, not a run-ender.
- **D3 Endings:** **Consolidate to the 2 reachable endings** — The Heart (Heat-led) and
  The Main Character (Fame-led). Drop Brand + Dark Horse everywhere they're advertised.
- **D4 Headcount:** **5 NPCs canon** (you + 5 = "6 creators"). Every screen agrees.
- **Derived:** With no real eviction (D2) and no Brand ending (D3), the **Image/Trust meter**
  is repurposed as the **audience-pressure axis** that drives eviction-night tension only.
  Fame + Heat decide the ending; Image/Trust decides how much you sweat.

## The fix set

### P0 — make the core honest
1. **Remove real player eviction.** In `lib/creator-house.ts` (`buildEviction`, ~line 82-118)
   the CRITICAL branch sets `playerEvicted` and ends the run. Make the player un-evictable:
   eviction nights always resolve with someone else leaving (Dev @ D3; Zoya-or-ally @ D7),
   and a low-Trust player gets the *nominated-but-survives* beat, never the *out* beat.
   Reframe `EvictionScreen.tsx` + `CHStatusCard` copy from "Ghar se bahar / KHATRE MEIN →
   run ends" to audience-pressure / "you were nominated, you survived" language.
2. **Consolidate endings to 2.** Update `resolveEnding` (`lib/game.ts:443`) to resolve only
   The Heart (Heat-led) and The Main Character (Fame-led), with a defined tie-break, and make
   sure BOTH are actually reachable (today Heat-first at a low threshold makes Heart a 94.6%
   default — give Fame-led players a real path to Main). Update `FINALE_DATA` (`LiveScreen.tsx:42`)
   and the world-intro "4 endings" copy to 2. Re-run `docs/creator-house-v2-outcome-report`
   sim and confirm a healthy Heart/Main split (target neither >~75%).
3. **One canonical headcount.** Narrator reveal → 5 NPCs (remove Meher/Rishi/Adi, who have no
   content). Fix the Worlds card teaser ("8 housemates" → "6 creators") in
   `components/screens/WorldsScreen.tsx`, and align world-intro + `DMInboxScreen` counts.

### P1 — teach the player the game
4. **Fix the onboarding flow (corrected).** The world-intro is NOT skipped — the real flow is
   `WorldsScreen` CH card → `world-intro` (4 slides) → `startGame()` → **`narrator`** → **`feed`**.
   So CH shows TWO intros (the 4-slide carousel + the narrator cast reveal) and lands on Feed.
   Cricket is `card → cricket-carousel → live` (one intro, lands on the engine). Fix: collapse
   to one intro and land on **Live** (`NarratorScreen.tsx:46` and `app/page.tsx` startGame route
   to `live`, not `feed`); state the goal plainly in the HUD. (See Cross-world parity P2.)
5. **Teach Trust = safety.** Add the missing "DMs build Trust, Trust keeps you off the block"
   coach-mark in the CH coach-mark set (`LiveScreen.tsx:135`). Today the only rule that matters
   is invisible.
6. **De-jargon labels.** "STORY DROP · DAY n" → a plain "NEXT CHOICE · DAY n"; surface what
   Image/Trust means where it's first shown, not only at the finale.

### P2 — closure & hygiene
7. **Remove dead `rivalryScore`** (tracked in `lib/game.ts` flags, never read) — or note it as
   intentionally reserved. Decide one.
8. **Add a finale recap** before returning to Worlds: which ending you got + why (top meter),
   days survived, a "play again" affordance. Today the finale resolves by silent meter math.

## NOT in scope (deferred — chose HOLD SCOPE)
- 3rd eviction / Day-5 "danger week" framing (bible v2 has it; build has 2 evictions).
- Dynamic situation queue / replay variation (`buildCHQueue` ignores its params today).
- Promoting Meher/Rishi/Adi to real characters (would be a content build).
- Authored per-ending finale scenarios (beyond the recap card).

## Findings registry
| # | Finding | Severity | Resolution |
|---|---------|----------|------------|
| 1 | 94.6% of paths → The Heart; Brand + Dark Horse unreachable (sim) | P0 | D3: consolidate to 2 reachable endings |
| 2 | Bible "always reach finale" vs build "real eviction at D3/D7" | P0 | D2: psychological only |
| 3 | Headcount differs per screen (6 vs 8) | P0 | D4: 5 NPCs canon, fix all screens |
| 4 | WorldIntro (meters/evictions/goal) skipped; goal never stated | P1 | Fix #4 |
| 5 | Trust = survival never taught; built via DMs silently | P1 | Fix #5 |
| 6 | "STORY DROP" jargon; Image/Trust unexplained | P1 | Fix #6 |
| 7 | `rivalryScore` tracked, never used | P2 | Fix #7 |
| 8 | No finale recap / ending explainer / play-again | P2 | Fix #8 |

## Verification
- After fixes: `npx tsc --noEmit` + `npm run build` clean; existing `creator-house.test.ts`
  green (add cases for: player never evicted; both endings reachable).
- Re-run the outcome simulation; confirm 2 endings with a balanced split.
- In-browser: full CH run start→finale — intro teaches the rules, goal is visible, an
  eviction night fires and the player is nominated-but-stays, finale shows a recap.
- Next: `/plan-design-review` on Creator House (the UI/UX pass), then implement.

## Design review (UX) additions
`/plan-design-review` — overall **5/10 → target 9/10**. Per-dimension: Info-Arch 4, States 3,
Journey 4, AI-slop 8 (strong, on-brief — keep), Design-system 7, Responsive/A11y 6.
Decisions: **DD1 land-on-Live**, **DD2 nominated-but-saved eviction**.

9. **Land on the engine.** After the narrator, route Creator House to **Live** (the first
   choice), not Feed (`NarratorScreen.tsx:46`). Feed becomes the between-beat reward. Add a
   **visible goal line** to the Live HUD (CH has no equivalent of cricket's GoalCard today).
10. **Reframe eviction night as audience pressure (DD2).** Player can be *nominated* when
    Trust is low; the audience vote **always saves** them; the aftermath makes clear the house
    noticed and it costs socially next beat. Relabel `CHStatusCard` "EVICTION RISK" →
    "ON THE BLOCK / AUDIENCE PRESSURE" (never terminal); rewrite `EvictionScreen` copy from
    "you're out" to "the audience kept you — barely." (Implements P0 #1's UX half.)
11. **Specify interaction states** (weakest dimension, 3/10): AI-DM reply **loading + failure**
    state (`DMThreadScreen`), the **"you survived"** confirmation beat after an eviction, and
    the **first-run DM-inbox + feed empty** states. Each = what the user *sees*, not backend.
12. **Surface meter meaning:** a one-line gloss for Fame / Heat / Trust where each is first
    shown — not only at the finale.
13. **A11y:** 44px min touch targets on choice buttons + badges; contrast ≥4.5:1 on `--ink3`
    body text and small pills.
14. **Finale recap card** (also covers P2 #8): ending title + one-line why + Fame/Heat/Trust
    chips + run stats (days, choices, eviction nights weathered) + "Play again" / "View profile."

**Mockups:** the two new pieces (audience-pressure eviction moment + finale recap) are briefed
and ready to generate via the gstack designer, **blocked on OpenAI org verification** for the
key in `.env.local` (verify at platform.openai.com → settings/organization, ~15 min to propagate).

## Cross-world parity (Indian Dressing Room = the standard)
New requirement: the surfaces that are the SAME in both worlds must look and behave the same,
with **cricket as the reference**. Audited the shared screens; cricket-only mechanics that don't
belong in CH are listed as "preserve" (not parity bugs). All in `components/screens/LiveScreen.tsx`,
`FeedScreen.tsx`, `DMThreadScreen.tsx`, `app/page.tsx`, `components/CHStatusCard.tsx`, `GoalCard.tsx`.

15. **Live choice presentation → cricket standard (headline parity item).** Cricket uses a bottom
    sheet: a bold accent **peek button carrying the question + chevron** → expanded **centered
    question header** → **frosted-glass ChoiceCards** → result handle. CH still uses the old flat
    sticky-bar with plain cards and no peek/sheet. Bring CH's choice UI to cricket's (the
    `isCricket` branches in `LiveScreen.tsx` ~lines 1165-1275). **Bug to fix:** the outcome-gate
    flash (`outcomeFlash`, ~lines 639-693) is set regardless of world but only rendered on the
    cricket path, so CH outcome-gate results are silently dropped — render it for CH too.
16. **Onboarding flow parity (= fix #4).** Collapse CH's double-intro (world-intro carousel +
    narrator) to a single cricket-shaped intro and land on **Live**. `NarratorScreen.tsx:46` →
    `live`; reconcile the `WorldIntroScreen` resume guard.
17. **Coach-marks parity.** `LiveScreen.tsx:129-138`: CH has 2 steps and `tabCount: 3` while the
    tab bar renders 4 tabs, so the highlight lands on the WRONG tab. Make CH 3 steps with
    `tabCount: 4`, adding the missing "Characters se baat karo" (DMs) step (also = fix #5).
18. **Visible goal line parity.** CH's `CHStatusCard` shows only eviction-risk; cricket's
    `GoalCard` shows a forward "AGLA TARGET" goal. Give CH a cricket-style goal line (reuse the
    GoalCard pattern) as part of the DD2 audience-pressure reframe. Verify CHStatusCard's
    status colors are intentional severity colors, not a broken metric mapping.
19. **"N new" feed badge parity.** CH's Live "Go to Feed" button lacks the `{newPosts} new`
    badge cricket shows (`LiveScreen.tsx:1195` vs cricket `:1270`). Add it.
20. **Relationship-fallout feed posts.** Cricket renders alert posts when a bond drops
    (`FeedScreen.tsx:526`, `isCricket`-gated); CH has no equivalent. Add a CH version OR mark
    explicitly out-of-scope (DECISION NEEDED — flagged for eng review).

**Preserve (cricket-only by design, NOT parity bugs):** trust-goal gate card + trust-moment
"real talk" prompts (`DMThreadScreen`) are cricket season mechanics; CH's relationship-context
bond card is CH-only; world-specific seed posts, meter labels (FORM/FAME/TEAM-TRUST vs
FAME/HEAT/TRUST), and carousel content stay per-world. Tab bar + MeterHUD + DM thread typing/
locked/empty states are already identical — keep.

## Engineering review
Decisions: **ED1 one PR** (single branch, all 20 items) **with mandatory cricket regression tests**;
**ED2 extract a shared `ChoiceSheet`** (refactor-first); **ED3 defer** relationship-fallout posts.

**Architecture findings (confidence 9/10, verified in code):**
- `resolveEnding` (`lib/game.ts:443`) is **Creator-House-only**; cricket uses `resolveCricketEnding`
  (`lib/cricket-rules.ts:12`), selected at `LiveScreen.tsx:399` via `isCricket ? … : …`. So the
  endings + stakes + headcount changes **cannot break cricket** — the only shared-code risk is the
  Live choice UI.
- **ED2:** extract cricket's peek-button + bottom-sheet + frosted-card (LiveScreen ~1221-1275) into a
  world-agnostic `components/ChoiceSheet.tsx` (props: question, choices, social-proof, sheetOpen,
  onChoose, result). **Re-point cricket at it FIRST and prove cricket renders/behaves identically
  (regression test), THEN point CH at it.** Single code path → no future drift.
- **Onboarding:** route CH past the narrator to `live` (`app/page.tsx` startGame + `NarratorScreen.tsx:46`);
  reconcile the `WorldIntroScreen` resume guard; collapse the double-intro to one.
- **Bug (confidence 8/10):** `outcomeFlash` (LiveScreen ~639-693) is set regardless of world but only
  rendered on the cricket path, so CH outcome-gate results are silently dropped — render it for CH too.

**Test coverage (vitest; cricket regression is CRITICAL because ED1 is one PR):**
```
[~] components/ChoiceSheet.tsx (NEW, extracted)
  ├── [CRITICAL ★★★] cricket renders + behaves identically pre/post extraction (REGRESSION)
  └── [★★ NEW] CH renders peek button + sheet + frosted cards (parity)
[~] lib/creator-house.ts buildEviction()
  ├── [★★★ NEW] low Trust → player NOMINATED but playerEvicted never true (psychological-only)
  └── [★★ ] safe path unchanged
[~] lib/game.ts resolveEnding()
  ├── [★★★ NEW] heat-led → 'heart'; fame-led → 'main'; both reachable
  └── [★★★ NEW] 'brand' + 'dark' removed (2 endings only)
[~] app/page.tsx startGame + NarratorScreen → [★★ NEW] CH lands on 'live'
[~] LiveScreen coach-marks → [★ NEW] CH = 3 steps, tabCount 4 (highlight aligns)
[~] LiveScreen outcomeFlash → [★★ NEW regression] renders for CH
Re-run docs/creator-house-v2-outcome-report sim → assert 2 endings, neither >~75%
```

**Failure modes / critical gaps:**
- ChoiceSheet extraction regresses cricket → MITIGATED by the CRITICAL cricket regression test (gate the PR on it).
- Endings consolidation alone may still leave Heart dominant (Heat is easy to pump) → re-sim and, if Main < ~25%, nudge the resolution threshold so Fame-led players reach Main.

**Implementation order (one PR, refactor-first so cricket stays green throughout):**
1. Extract `ChoiceSheet`, re-point cricket, land cricket regression test (no behavior change).
2. CH rules: psychological stakes + 2 endings + 5-NPC headcount + content JSON + unit tests + re-sim.
3. CH UI parity: point CH at `ChoiceSheet`; onboarding land-on-Live; coach-marks; goal line; N-new badge; CHStatusCard audience-pressure reframe.
4. Finale recap + a11y (44px / contrast) + outcomeFlash CH fix + de-jargon labels.

**NOT in scope (eng):** relationship-fallout posts (ED3 → TODO), dynamic queue, 3rd eviction / Day-5 week,
promoting Meher/Rishi/Adi, real avatar upload, real account deletion.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | ISSUES OPEN | HOLD_SCOPE; 8 findings (3 P0); decisions D1-D4 |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | ISSUES OPEN | 5/10 → target 9/10; DD1-DD2; fixes #9-#14 |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | one-PR + cricket regression tests; extract ChoiceSheet; 1 bug (outcomeFlash); ED1-ED3 |

- **UNRESOLVED:** 0 — all decisions made (D1-D4, DD1-DD2, ED1-ED3).
- **VERDICT:** CEO + Design + ENG complete (HOLD SCOPE). 20-item fix set + parity specified, cricket-safe via refactor-first + regression tests. **Ready to implement.**
