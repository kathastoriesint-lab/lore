# Creator House v2 — Design Brief / Generation Prompts

**For:** Claude design (screen-by-screen generation)
**Companion to:** `creator-house-world-bible-v2.md`, `creator-house-tech-architecture.md`
**Target:** Saturday user-testing launch

How to use this: Part 0 is shared context — paste it before any single-screen prompt.
Parts 1–9 are per-screen prompts you can generate individually. Part 10 is the
post/caption/reaction anatomy (referenced by Feed + Live). Part 11 is the motion +
feedback system. Part 12 is design tokens.

---

## PART 0 — Shared Context (paste before every screen prompt)

**Product:** Lore is a mobile interactive-fiction app. You inhabit a character inside a
richly-built world and make choices that shape the story. This world is **Creator House**:
you're a new Indian content creator who just entered a reality-show villa with 5 others.
10 days, cameras everywhere, evictions every few days, the internet watching. Your choices
move three meters and the world reacts to you in a live Instagram-style feed.

**Audience:** Indian mobile users 18–30. They live on Instagram and Bigg Boss. The app
should feel like a premium social app that happens to be a game, not a game that looks like
an app.

**Aesthetic:** Dark, cinematic, Instagram-native. Reality-TV-meets-Instagram. Think a
late-night drama poster crossed with a clean IG feed. Deep near-black backgrounds, one hot
accent (magenta-pink), restrained use of per-character color. Editorial serif for emotional
/ dramatic text, clean sans for UI and data. Grain texture on hero cards. Never cartoonish,
never "gamey" — the stakes are social and emotional, the visual language is fashion-editorial.

**Platform:** Mobile-first, single phone viewport (≈390×844). Vertical. Thumb-reachable
primary actions. No desktop layout.

**Language:** Content is Hinglish (Hindi-English mix in Latin script). UI labels are English.

---

## PART 1 — The Persistent Meter HUD (the spine of the whole app)

This is the most important shared component. It sits pinned at the **top of every in-world
screen** (Feed, Live, Profile, Vote, Eviction). It never scrolls away. It is the player's
constant read on "where do I stand."

**What it shows, always:**
- The player's handle + a **follower count** (the headline vanity number, derived from Fame)
- Three meters, always visible, never hidden:
  - **Fame ⭐** — visibility / followers
  - **Heat 🔥** — relationships in the house
  - **Image 🤝** — public perception / brand value
- Each meter: a label, a current value (0–100), and a thin progress bar in the meter's color
  (Fame = warm gold, Heat = hot red-orange, Image = teal)

**Layout direction:** A compact two-tier bar. Top tier: avatar + @handle on the left,
follower count on the right (e.g. "48.2K followers"). Bottom tier: three equal meter
readouts in a row, each with icon + value + slim bar. The whole HUD is ~88–104px tall,
sticky, with a subtle bottom divider and a slight blur/scrim so feed content reading
underneath stays legible.

**The critical behavior — every change is loud and legible:**
When a choice or action shifts a meter, the HUD must *perform* the change, not just update
silently:
- The affected meter's number **ticks** from old to new value
- Its bar animates to the new width
- A **+N / −N chip flies up** out of that meter in its color, then fades
- A soft glow pulses on that meter for ~600ms
- The follower count rolls up/down digit-by-digit when Fame changes
- If multiple meters change at once, they animate together, each with its own chip

This is the "every action clearly highlights what happened" requirement. The HUD is where
consequence becomes visible. The old design flashed deltas and lost them — here the new
value persists in the HUD and the delta animation draws the eye to it.

**States:**
- Default (resting): all three visible, current values
- Changing (post-action): tick + chip + glow as above
- Milestone (a meter crosses a threshold like Fame 70): a brief stronger pulse + the meter
  label briefly shows the status it unlocked ("Trending")

Generate the HUD as a standalone component first, with: resting state, a +Fame/−Heat
change state mid-animation, and a milestone state.

---

## PART 2 — Worlds Screen (entry)

**Purpose:** Choose which world to enter. Two live worlds (Creator House, Cricket
Dressing Room) plus "coming soon" cards for breadth.

**Layout:** App title "Lore" + tagline at top. A vertical stack of large world cards. Each
card is a full-bleed gradient/image with: a status badge (LIVE / COMING SOON), the world
name in editorial serif, a one-line teaser, a row of NPC avatar chips, and a follower/
member count. The LIVE world (Creator House) is visually dominant — bigger, brighter,
clearly the thing to tap. Bottom tab bar: Worlds, Profile.

**States:** Creator House = LIVE and inviting. Cricket = LIVE or COMING SOON. Two more =
COMING SOON, dimmed but intriguing.

No persistent meter HUD here (you're outside any world). This is the one screen without it.

---

## PART 3 — Cinematic Intro (first entry into Creator House)

**Purpose:** A 15–25 second in-app cinematic that explains the world and reveals the cast
with their relationship to you. Builds context and stakes before any interaction.

**Layout / sequence:** Full-screen, dark, theatrical. Plays as a timed sequence (tap to
advance or auto-advance):
1. Title card: "Creator House." in large serif, "6 creators. Ek villa. 10 din." fades in.
2. A line of stakes: "Tum sabse naye ho. Koi tumhe nahi jaanta — abhi."
3. Character reveals, one at a time — each fills the screen: a portrait, the name, the
   handle + follower count, and a **relationship label** that lands with weight:
   - Ria — "Your Archrival"
   - Kabir — "Your Old Ally" (or "Your Crush" for female players)
   - Ananya — "Your Crush" (or "Your Confidante" for female players)
   - Dev — "Wild Card"
   - Zoya — "The Schemer" (revealed more ambiguously — "Your New Friend?")
4. Final card: "10 din. 3 evictions. Ek tum. Ready?" → CTA into onboarding.

**Feel:** Like a Netflix reality-show cold open. Per-character color washes, grain, slow
push-in on portraits, type that arrives with confidence. The relationship label is the
emotional hook of each reveal — give it room.

**Note:** Real video is planned for v3; for Saturday this is built in-app with motion +
type + the character portraits. Design it so a video could drop into the same slot later.

---

## PART 4 — Onboarding (name + gender)

**Purpose:** Collect the two world inputs that personalize everything: name and gender.

**Layout:** Minimal, intimate, one thing at a time. Dark screen, centered.
1. "Is ghar mein tum kaun ho?" → a single name input with a soft underline, large type,
   a blinking cursor. Feels like signing into the story, not filling a form.
2. Gender select: two large tappable cards/toggles (e.g. "She / Her" and "He / Him"),
   visually elegant, not clinical. A one-line explainer that this shapes who notices you
   in the house.
3. A starting-state reveal: once chosen, briefly show "Starting out: Fame 20 · Heat 50 ·
   Image 30" as the meters animate up from zero — the player's first taste of the HUD.
4. CTA: "Andar jao →"

**Feel:** Personal, warm, a held breath before the chaos. This is where "you" becomes real.

---

## PART 5 — Feed (the Living Feed — home base)

**Purpose:** The home of the app. A persistent, growing Instagram-style feed that is the
record of your season. Your choices become posts here; the house reacts around you; fans
comment. It grows from a few seed posts to 35+ as you play. This is where you launch each
new story beat and where you see your consequences land.

**Persistent meter HUD pinned at top (Part 1).**

**Feed content, top to bottom:**
1. **Stories ring** (optional, secondary) — avatar rings for each housemate, tap to view a
   short "story."
2. **The next Story Drop card** — a bold, can't-miss card that launches the next situation
   in Live. Labeled with the day/time ("DAY 1 · MORNING"), a teaser title, a Play CTA.
   This is the primary action on the feed.
3. **Your latest post** (just made) — see Part 10 for anatomy. The newest post animates its
   reactions rolling in. Tagged "your move."
4. **House reactions** — NPC posts that dropped in response to your choices ("reacting to
   your move"), styled distinctly.
5. **Your history** — every earlier post you've made, in reverse-chronological order.
6. **Seed posts** — the pre-house world (Ria's polished post, a gossip account's leak,
   etc.) at the bottom.

Bottom tab bar: Feed, Messages (dimmed/locked for Saturday), Live, Profile.

**States:** fresh-entry (few posts), mid-arc (many posts, rich history), just-after-choice
(new post at top, reactions animating, HUD showing the meter change that just happened).

**The key feeling:** scrolling your own feed should feel like reading your season back —
your wins, your messes, who clapped, who came for you.

---

## PART 6 — Live (the situation player)

**Purpose:** The focused decision moment. Read the scene, feel the pressure, choose. One
situation at a time.

**Persistent meter HUD pinned at top (Part 1)** — so the player always sees what's at stake
as they read.

**Layout (vertical, scrolls within the screen):**
1. **Day/slot tag** — "⚡ DAY 1 · MORNING" + a small LIVE indicator.
2. **Title** — short, punchy, editorial serif.
3. **Narrator body** — 3–4 short paragraphs, second-person Hinglish, set like prose
   (readable, generous line height). This is written to be read aloud — leave a slot for an
   optional **audio play button** ("▶ Sunno") near the title for future VO.
4. **Reactor card** — one NPC's avatar + a line of pressure/advice before you decide,
   visually set apart (a chat-bubble or quote block in the character's color).
5. **The question** — "Kya karoge?" centered, emphatic.
6. **Two choice cards** — each shows a title + a one-line framing. Large, tappable, clearly
   distinct. Do NOT show meter deltas before choosing (the player should weigh the fiction,
   not min-max numbers). A subtle "X% chose this" can appear after choosing.

**After choosing (the impact moment):**
- The chosen card locks/highlights, the other dims.
- The **HUD performs the meter change** (Part 1 + Part 11) — this is the payoff.
- A brief "Posted to feed ✓" confirmation.
- The first NPC reaction surfaces inline as a taste.
- Then a **"NEXT →"** (or auto-return to the feed, where the full post + all reactions now
  live). Design both the inline impact state and the transition.

**Optional media slot:** a hero image/video can sit above the body on big situations. Empty
for Saturday — design the text-only default, but leave the slot.

---

## PART 7 — Post / Caption / Reaction Anatomy (used by Feed + Live)

This is the unit the user specifically wants rethought. Two post types:

**A) YOUR post (player choice → post):**
- Header: your avatar + @yourhandle + "just now" + a small **"your move"** tag.
- Body: the **caption** is the hero — your line of Hinglish ("Solo deal. Mera naam. 🤍")
  set large over a textured/gradient card (per the dramatic tone), OR as clean text on a
  card. Caption should feel like a real IG caption with attitude, not a system message.
- Below: **reactions as threaded comments** — each is avatar + name + text. Two come from
  housemates (in their character color), one from a **fan account** (styled differently —
  a generic avatar, a handle like @creator.tea, slightly smaller). For the newest post,
  these roll in one by one with a stagger (the "world is reacting" feeling).
- Footer: like count, comment count, a like button that responds when tapped.

**B) HOUSE reaction post (an NPC posts about your move):**
- Header: NPC avatar + handle + "reacting to your move" in the accent color + a "NEW" pill.
- Body: their caption over their character-color card.
- These prove the world changed because of you. Visually they read as "someone in the house
  subposting you."

**Fan-comment styling:** fan accounts (@creator.tea = gossip/hype, @housewatch_india =
analytical) must look clearly like outsiders vs housemates — different avatar treatment,
maybe a faint "fan" tag. They're the internet peanut gallery.

Generate: your-post (resting), your-post (reactions animating in), house-reaction post,
and a fan comment, as a component sheet.

---

## PART 8 — Vote (eviction night)

**Purpose:** On Day 3, 7, 9 — the player votes who to evict. The vote feels consequential;
the outcome is authored.

**Layout:** Tense, high-stakes. Dark, spotlit. "ELIMINATION" or "Aaj koi ghar jaayega" header.
The remaining housemates shown as a row/grid of portraits. The player taps one to nominate.
A confirm step ("Vote pakka?"). Then transition to the Eviction reveal.

**Persistent meter HUD at top** (the player should see their standing as they vote).

**Feel:** Reality-show elimination tension. Low light, a countdown energy, the weight of
choosing. The chosen portrait gets a "VOTED" treatment.

---

## PART 9 — Eviction (the reveal)

**Purpose:** Reveal who's leaving + a short farewell beat.

**Layout:** Cinematic. The evicted character's portrait, name, a goodbye line. If it's an
emotionally heavy exit (Kabir/your crush), the farewell carries weight — a quiet,
slow-motion treatment. If it's a satisfying exit (Zoya), a cooler treatment. A line on what
their leaving means for the house. Then back to the feed.

**Feel:** The emotional punctuation of the arc. Don't rush it. This is a moment.

---

## PART 10 — Ending (Day 10 arc outcome)

**Purpose:** The finale payoff. One of four endings based on final meters.

**Layout:** Full-screen, theatrical, a victory/identity reveal. The ending name in large
serif ("The Main Character" / "The Heart" / "The Brand" / "The Dark Horse"), a paragraph of
Hinglish payoff text, the player's final meter values shown one last time (the HUD made
permanent), the final follower count as a headline. A shareable feel — this is what a player
screenshots. CTA: replay / try another path / back to Worlds.

**Feel:** Earned. Cinematic. The kind of screen someone posts to their story.

---

## PART 11 — Profile (consistency requirement)

**Purpose:** The player's identity page. Crucially, the user wants the **same persistent
meter HUD here** as everywhere else — meters and follower count must be consistent and
always visible, not a different treatment.

**Layout:** IG-profile-like. Avatar + @handle + the **same HUD meters at top** (Fame/Heat/
Image + follower count — identical component to the rest of the app). Bio line (your role +
"Creator House · Day N of 10"). A relationships strip (the housemates + your standing with
each). A grid of your posts (the captions you've made this season — pulled from your feed
history). 

**The consistency rule:** the three meters and follower count appear here exactly as they do
on Feed/Live — same component, same values, same change-animation behavior. A player glancing
at Profile sees the identical numbers they see everywhere. No divergent "profile stats" vs
"game meters."

---

## PART 12 — Motion + Feedback System (applies everywhere)

The user's core requirement: **every action must clearly highlight what just happened.**
Codify it:

- **Meter change:** number ticks + bar animates + colored +N/−N chip flies up + soft glow.
  Always in the persistent HUD so the new value stays visible after the animation.
- **Follower change:** digit roll on the headline count.
- **Choice made:** chosen card locks/glows, other dims, "Posted to feed ✓" confirm.
- **Like/comment on a post:** the icon responds, a small count bump, a micro-confirmation.
- **Reactions arriving:** staggered roll-in on the newest post (the world reacting in real
  time).
- **Threshold crossed:** a stronger one-time pulse + a status label ("Trending", "Fan
  Favourite incoming").
- **Eviction / ending:** full-screen, slower, cinematic — the big punctuation moments.

Principle: small actions get small, instant, legible feedback; big story moments get
full-screen cinematic treatment. Nothing happens silently.

---

## PART 13 — Design Tokens (direction, not law)

- **Background:** near-black, layered (#0A0A0F base, #12121A cards, #1C1C26 raised).
- **Accent:** hot magenta-pink (the Lore signature) for primary actions, "your move", LIVE.
- **Meter colors:** Fame = warm gold (#FFB020), Heat = hot red-orange (#FF5C3A), Image =
  teal (#3DD6C8).
- **Per-character colors:** each housemate a signature hue, used in their posts/reactions
  (Ria = rose-red, Kabir = blue, Ananya = purple, Dev = green, Zoya = mauve-pink).
- **Type:** editorial serif for titles, emotional, and dramatic content (e.g. a high-contrast
  display serif); clean grotesk sans for UI, labels, numbers, data.
- **Texture:** subtle film grain on hero/post cards. Soft gradients. Vignettes on cinematic
  screens.
- **Radius / spacing:** generous radii on cards (16–20px), comfortable padding, IG-like
  rhythm. Thumb-reachable primary CTAs.
- **Motion:** confident and quick for UI (150–250ms), slow and cinematic for story moments
  (600ms+). Easing: smooth ease-out for arrivals.

Mood: a premium dark social app with reality-TV drama in its bones. Editorial, not gamey.
Intimate, not corporate. Every screen should look like something a 22-year-old in Mumbai
would screenshot.
```
