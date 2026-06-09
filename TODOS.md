# Lore — Master TODO List
_Last updated: 2026-06-07. Sources: dev testing Supabase feedback (54 items) + friend user test + CEO review sprint plan._

---

## P0 — Critical bugs (fix before any user testing)

### P0-1 · Duplicate DM messages (🐛 ids 50, 51)
**What:** Every character message appears twice. "Each Message from Maddy coming twice", "Sabke messages repeat ho rhe hain".
**Where:** `DMThreadScreen.tsx` — likely a double `injectCharDM` call or a race in the DM inject + AI reply flow.
**Fix:** Find where DMs are injected and ensure the trigger fires exactly once. Check `makeChoice` in `app/page.tsx` — the DM inject and AI reply may both be adding a message.

### P0-2 · Auto-skip to next situation bug (🐛 ids 11, 13, 16, 17)
**What:** After making a choice, the app jumps two situations ahead instead of one. Affects both worlds. "next situation also got selected automatically and got skipped", "every time I directly jump to next situation".
**Where:** `advanceSituation` callback in `app/page.tsx` or `LiveScreen.tsx` — likely called twice.
**Fix:** Add a guard so `advanceSituation` can only fire once per choice flow. Check if it's triggered by both the choice completion AND a useEffect.

### P0-3 · Feed like/comment interactions broken (🐛 ids 52, 53, 54)
**What:** Tapping like doesn't increment likes. Adding comment doesn't show. Arrow button not clickable.
**Where:** `FeedScreen.tsx` — interactive actions on posts.
**Fix:** Debug the like/comment handlers. Likely a state update not triggering re-render, or event propagation blocked by a parent element.

---

## P1 — Must ship before user testing

### P1-1 · Duplicate DM messages (same as P0-1 — top priority)

### P1-2 · DMs: flagship feature — Kavana-style depth + 20-message cap
**What:** Make DMs the best feature in the app. Each character gets a 20-message cap per session, then locks for 6 hours. Characters ask questions back, build on prior messages, never give flat responses.
**Why:** Friend feedback: "absolutely love the chat feature — gold. I can see myself using this just to chat with Hardik Pandya." Dev testing: "Gold feature ❤️" (ids 48, 49). This is the product's biggest differentiator — go all in.
**What Kavana does right:** The character initiates. Asks questions. Has its own agenda. The conversation has momentum. Never feels like Q&A.
**Changes needed:**
1. Prompt tuning: add "Always end with a question or a provocation that continues the conversation. Never give a closing statement." to every character system prompt in `lore-chat/index.ts`.
2. Track `dmMessageCount: Record<CharId, number>` in GameState (per-character message counter).
3. Track `dmLockedUntil: Record<CharId, number>` (timestamp) in GameState.
4. `DMThreadScreen`: when count ≥ 20 AND lockedUntil > Date.now(), disable input and show: "Hardik ne apna phone band kar liya. Kal baat karna." + countdown timer.
5. On unlock: character opens with a callback reference: "Socha tera. Woh baat abhi bhi dimag mein hai."
6. Supabase schema: add `dm_message_count jsonb DEFAULT '{}'` and `dm_locked_until jsonb DEFAULT '{}'` to `game_state` table.
**Files:** `DMThreadScreen.tsx`, `lib/game.ts`, `lib/types.ts`, `supabase/functions/lore-chat/index.ts`, Supabase schema
**Effort:** M (human) / S (CC+gstack) · **Priority: P1**

### P1-3 · Unread DM tracking persists across navigation (🐛 id 23, friend feedback #3)
**What:** Unread dots reset when you navigate away from DM inbox. The `opened` Set is local component state.
**Fix:** Move to localStorage. Key: `lore_dm_opened_{userId}` (JSON object keyed by charId). Anon fallback: `lore_dm_opened_anon`. Show unread dot per-character based on `dmLastUpdated[charId] > lastOpenedTime[charId]`.
**File:** `components/screens/DMInboxScreen.tsx`

### P1-4 · Pass game flags to character DMs (Form/Fame/Trust + mentorTrust/hypeRisk)
**What:** Characters need to know your actual arc. Currently `player_meters` is passed but not `flags`.
**Fix:** Add `player_flags: gameState?.flags ?? null` to the `getAIReply` fetch body in `lib/game.ts` (~line 248). Add flags context block to `gameStateContext` in `supabase/functions/lore-chat/index.ts` (~line 399).
**DEPLOY REQUIRED after edge function change:** `supabase functions deploy lore-chat --no-verify-jwt`
**File:** `lib/game.ts`, `supabase/functions/lore-chat/index.ts`

### P1-5 · Outcome text after choices — show WHY it worked/failed (✨ id 43, friend feedback, dev id 18)
**What:** After a choice fires, show 1-2 lines explaining the consequence. "Your Form (38) was too low — Hardik saw the hesitation." Add to ImpactPill display.
**Fix:** Add `outcomeText?: string` and `text?: string` on `ChoiceOutcome` to `lib/types.ts`. Author text for 8-12 key situations starting with CR-S3, CR-S7, CR-S18.
**Files:** `lib/types.ts`, `components/ImpactPill.tsx`, `lib/cricket-data.ts`

### P1-6 · Option gating — grey out choices when meters too low (friend biggest takeaway #1)
**What:** Add `requireGate` field to `Choice` type. Some options locked if Form/Trust below threshold. Show "Requires Form 50+" label.
**Situations to gate:** CR-S7 Choice B (opener slot, Form 50+), CR-S12 Choice A (challenge selection, Trust 55+), CR-S18 Choice A (aggressive play, Form 45+), CR-S22 Choice B (demand guarantee, Trust 60+).
**Files:** `lib/types.ts`, `components/screens/LiveScreen.tsx`, `lib/cricket-data.ts`

### P1-7 · Buttons English, content Hinglish (🐛 ids 5, 6, 26, 40)
**What:** Multiple reports of Hindi buttons — "Ghar mein aao" → "Enter the house", "Baad mein" → "Skip", "Shuru karte hai" → "Let's begin" or "Start". Rule: all tap targets/CTAs in English. All narrative/dialogue in Hinglish.
**Files:** `WorldIntroScreen.tsx`, `OnboardingScreen.tsx`, `NarratorScreen.tsx` — audit all button labels.

### P1-8 · Remove DMs from Creator House entirely (🐛 id 35)
**What:** "DMs should not be there in the Creator House experience. Remove DMs and notifications too."
**Fix:** In `DMInboxScreen` and nav tabs, hide DMs when `game.world === 'creator-house'`. Also hide DM badge/notification from tab bar.
**File:** `DMInboxScreen.tsx`, `app/page.tsx` nav tab logic

### P1-9 · Remove Search and + button from DM inbox (✨ id 44)
**What:** DM inbox has a search bar and a compose (+) button that don't function. Remove them.
**File:** `components/screens/DMInboxScreen.tsx`

### P1-10 · Character subtexts in DM list (🐛 ids 45, 46)
**What:** Maddy should show "School friend" subtext. Coach Sir should show "Childhood coach". Other characters should show their role.
**Fix:** Add `subtitle` field to `Character` type OR hardcode in DM inbox render. Use existing `role` field from `CRICKET_CHARS`.
**File:** `components/screens/DMInboxScreen.tsx`, `lib/cricket-data.ts`

### P1-11 · Latest DM on top in inbox (🐛 id 31)
**What:** "When a DM comes, that DM should be on the top." Inbox should sort by most recent message.
**Note:** The current sort uses `dmLastUpdated` — check if this is being updated correctly on DM inject.
**File:** `components/screens/DMInboxScreen.tsx`

---

## P2 — High value, build soon

### P2-1 · Conditional feed reactions from Tilak/Coach based on Form (friend feedback #9)
**What:** 5 situations get two `feedReaction` variants — high-Form (supportive) and low-Form (critical). Driver: `game.meters.fame` (Form slot in cricket).
**Authored copy (ready):**
- S3 Tilak high (Form ≥ 45): "Ek session se judge mat karo." Low: "Dikhao mat, dekho."
- S4 CoachSir high: "Surya ka time lena mat bhoolna." Low: "Pehle basics, phir angles."
- S7 Tilak high: "XI mein hai matlab trust hai." Low: "Sideline practice bhi practice hai."
- S12 CoachSir high: "Press mein simple raha. Acha." Low: "Hype aur haqeeqat mein gap band karo."
- S18 Tilak high: "Solid. Yeh woh innings hai jo log yaad rakhte hain." Low: "Form wapas aata hai."
**Files:** `lib/types.ts`, `lib/cricket-data.ts`, `components/screens/FeedScreen.tsx`

### P2-2 · Post-match standings posts from @cricketroom_india (friend feedback #8, user clarification)
**What:** After key match situations (debut CR-S10, league CR-S18, clutch CR-S24), inject an authored @cricketroom_india post with MI standings context.
**No new UI needed** — use existing `CRICKET_SOCIAL_ACCOUNTS.cricketroom` + `ChoicePost` pattern.
**File:** `lib/cricket-data.ts`

### P2-3 · IPL standings screen — Orange Cap / Purple Cap (friend feedback #8)
**What:** New screen showing (1) IPL team table with MI position, (2) Orange Cap top 5 with player inserted at computed position from `runMemory`, (3) Purple Cap list. Access via "Standings" tab/button in Live nav.
**Files:** `components/screens/StandingsScreen.tsx` (new), `lib/cricket-standings.ts` (new), `app/page.tsx`

### P2-4 · Remove fake status bar OR make it consistent (🐛 id 3)
**What:** "Why is there a time and battery bar on top — remove it from everywhere." The fake status bar shows inconsistently.
**Fix:** Either remove `StatusBar` component sitewide or ensure it appears on every screen uniformly. Decide one approach.
**Files:** All screen components that import `StatusBar`

### P2-5 · Design language — consistent color system (🐛 ids 9, 15)
**What:** "Too many colors across the app, no design language." Profile page especially called out.
**Fix:** Audit `globals.css` color tokens. Ensure only `var(--accent)`, `var(--ink1/2/3)`, `var(--line)`, `var(--fame/heat/trust)` are used. Remove ad-hoc hex values from inline styles.
**Files:** `app/globals.css`, screen components

### P2-6 · Fix post timestamp — "S1" → relative time (🐛 id 14)
**What:** Feed posts show "S1" as timestamp subtext. Should show "2h ago", "Day 3", etc.
**Fix:** Replace situation-based label with a relative time or day-based label. As days progress, increment naturally.
**File:** `components/screens/FeedScreen.tsx`

### P2-7 · Feed posts tone — feel like posts not DMs (🐛 ids 36, 47)
**What:** "Posts from other players feel more like DMs than posts." Feed reactions are written as personal messages to the player, not social media posts.
**Fix:** Audit feed reaction copy in `lib/cricket-data.ts`. Posts should be written for a public audience, not addressed to "you". E.g. "MI dressing room ka naya kid kuch kar dikhayega" not "Tu accha khela."

### P2-8 · Why do likes/comments increase Form — meter logic (🐛 id 24)
**What:** "Why does liking things increase Form? Makes no sense." Feed interactions shouldn't move the Form meter.
**Fix:** Audit which meter deltas are triggered by feed actions. Form should only move from Live choices and practice-related decisions.
**File:** `lib/game.ts` or wherever feed interactions trigger deltas

### P2-9 · Cricket story should be 1st person not 3rd (✨ id 34)
**What:** "Phir bat tumhe deta hai" is 3rd person. Should be "Phir tumhe bat mila" or 1st person frame.
**Fix:** Audit cricket situation body text in `lib/cricket-data.ts`. All narrative should address the player as "tum" (2nd person) not refer to them as "tumhe" in a 3rd-person construction.

### P2-10 · Bad/unnatural Hinglish copy in cricket world (🐛 ids 10, 30, 38, 12)
**What:** Multiple specific lines flagged: "aaya prodigy" (id 10), "seene mai lag raha hai" (id 30), "Bas haan, yahan sab answer sheet dekhte hain" (id 38), "Welcome package" (id 12).
**Fix:** Replace each individually in `lib/cricket-data.ts`.

### P2-11 · Day not visible in feed (🐛 id 32)
**What:** "Day is not visible now" on feed screen.
**Fix:** Ensure day indicator shows on `FeedScreen`. May be a CSS/visibility issue.
**File:** `components/screens/FeedScreen.tsx`

### P2-12 · Day mismatch between HUD and feed (🐛 id 20)
**What:** "Above it shows day 1 below it shows day 9 how. Posts are also around day 7."
**Fix:** `MeterHUD` uses a formula for `currentDay`. `FeedScreen` uses a different source. Unify — both should use `SITUATIONS[game.situation]?.day` (or cricket equivalent).
**Files:** `components/MeterHUD.tsx`, `components/screens/FeedScreen.tsx`

### P2-13 · Fame meter shows wrong direction after choice (🐛 id 19)
**What:** "Fame seems increased when it has decreased — should be consistent everywhere."
**Fix:** Check ImpactPill delta direction indicators. Ensure positive/negative deltas show correct arrow direction and color.
**File:** `components/ImpactPill.tsx`

### P2-14 · Avatar crop control on upload (🐛 id 25)
**What:** "I uploaded my photo — it cropped it badly. Should give me option to crop accordingly."
**Fix:** Add a basic crop UI after image selection before committing. Or use `object-position` center crop as default with a manual adjust step.
**File:** `components/PlayerAvatar.tsx` or wherever upload is handled

### P2-15 · Avatar not syncing to cricket profile (🐛 id 27)
**What:** "Can't see my avatar in cricket world — not syncing everywhere."
**Fix:** Ensure `avatarUrl` from game state is read in the cricket world's profile view, not just Creator House.
**File:** `components/screens/ProfileScreen.tsx`, `components/PlayerAvatar.tsx`

### P2-16 · Player avatar should match world (🐛 id 28)
**What:** "My character should wear Mumbai Indians shirt in cricket world and look like a creator in Creator House."
**Fix:** Apply world-specific styling to PlayerAvatar. Cricket: blue MI accent ring/badge. Creator House: creator aesthetic.
**File:** `components/PlayerAvatar.tsx`

### P2-17 · "Kaam bol" — bad DM reply from Hardik (🐛 id 39)
**What:** Hardik replied "Kaam bol" — feels blunt/weird. The character prompt needs to be checked.
**Fix:** The Hardik prompt already says "Direct. Short. No softening." But "Kaam bol" as an opener is too aggressive out of context. Add a note to the prompt: don't open with command phrases, acknowledge first then be direct.
**File:** `supabase/functions/lore-chat/index.ts` — Hardik character prompt

---

## P3 — Post-testing / bigger scope

### P3-1 · Restore day gate to 6 hours (after testing done)
**What:** `gateMs = 0` currently. Restore to `6 * 60 * 60 * 1000` for production pacing.
**File:** `app/page.tsx` — search for `gateMs = 0`
**Also restore:** `isDayLocked` check in `LiveScreen.tsx` — currently forced to `false`.

### P3-2 · First-time onboarding tour (✨ id 7)
**What:** "A one-time experience telling you what each part of the app means — form, fame, trust, follower count, the choice, the story. Next, next, next, skip."
**Fix:** Build a `OnboardingTour` overlay that shows on first visit, highlights each UI element with a brief explanation. Dismissible.

### P3-3 · World intro — cinematic animation / video (❓ id 4)
**What:** "Very badly designed page. We should have had an animation. Write me a prompt which generates a 10–16 second clip of the entire world — who the characters are, what you do, what Form/Fame/Trust mean. Hindi-English."
**Fix:** Either an in-app animation sequence OR a generated video played before world entry.
**Note from id 4:** Full video prompt spec was given — capture it when building.

### P3-4 · Mini cricket game / "Video bhej" moment (🐛 dev + friend)
**What:** CoachSir's "Ab video bhej" line confuses users (looks like a UI prompt). Long-term: replace with an interactive net-session video or mini cricket game.
**Effort:** XL (human) / L (CC+gstack)

### P3-5 · Meter history log
**What:** Profile screen shows how meters changed over time: "Day 1 → Form +2 (studied film)".
**Requires:** New `meterHistory` array in GameState + Supabase schema + Profile screen view.

### P3-6 · Follower count should update with real users (❓ id 8)
**What:** "The number 4248 at the bottom should keep updating with more and more users."
**Fix:** The fame-to-follower conversion is per-player. The "other users in this world" count would need a real aggregate query. Post-scale feature.

### P3-7 · Creator House world order on Worlds screen (🐛 id 29)
**What:** "Creator House should be right after Cricket one." Currently world ordering may not be intentional.
**File:** `components/screens/WorldsScreen.tsx`

### P3-8 · World page profile bug (🐛 id 41)
**What:** "World page — profile page is buggy." Needs reproduction and specific diagnosis.

### P3-9 · Character arc memory — deep character.ai evolution
**What:** Characters should reference your full choice history, not just current meters. "You chose fame over form 3 times this week." Requires passing choice history summary to AI context.

### P3-10 · Sponsorship unlock events at Fame thresholds
**What:** When Fame crosses 70, a new situation unlocks: a brand deal. Meters as currency for exclusive events.

### P3-11 · Team selection narrative consequence
**What:** When you're not picked in XI, the app tells you WHY: "Trust was too low. Hardik went with Tilak instead." Narrative accountability.

---

## Already shipped / resolved

- ✅ Day gate disabled for testing (`gateMs = 0`, `isDayLocked = false`)
- ✅ Surya repeating "phir pagal ban" — fixed (commit 60d28a1)
- ✅ Rohit repeating "tempo samajh raha hia" — fixed (commit 60d28a1)
- ✅ Deployed to production: https://lore-next-ashy.vercel.app
