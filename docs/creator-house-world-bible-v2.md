# Creator House — World Bible v2

**Status:** Active  
**Last updated:** 2026-06-03  
**Arc:** 10 days · 32 situations · 3 evictions · 4 endings  
**House:** 6 people total (you + 5 NPCs)

---

## The Premise

6 creators. One villa in Goa. 10 days. Cameras everywhere, no script.

Every collab, every fight, every 3am terrace conversation — content. The audience votes on evictions. Brands watch the metrics. The internet has opinions.

You're the new one. You just walked in. No one knows you yet — but they will.

---

## The World

Creator House is an experiment: put 6 Indian creators in a villa for 10 days, see what happens. The format is simple — grow your audience, build the right alliances, make it to the finale. The reality is messier. Alliances form and break in 48 hours. Brand deals get poached. One viral moment changes the pecking order overnight.

**A note on stakes:** You always make it to the finale — the season is your story. But the audience reminds you every eviction night that you're being watched and judged. The Day 5 situations are framed under a "danger week" cloud — the internet speculates you might be the one to go. You're not (the script protects you), but the fear is real and the choices you make under that pressure matter. The threat is psychological, not mechanical.

This isn't Bigg Boss. There's no host, no tasks, no confessional camera. Just creators doing what they always do — making content — except now the content is each other.

---

## World Inputs

Two values are fed into this world at the start. Everything else is fixed.

| Input | Values | Effect |
|---|---|---|
| `player_name` | Any name | Used by NPCs in dialogue, feed comments, and player IG posts |
| `player_gender` | male / female | Swaps which character is the Crush and which is the Ally/Confidante (see rule below) |

**The swap rule:**

> The Crush is always the opposite gender to the player.  
> The Ally/Confidante is always the same gender as the player.

| player_gender | Crush | Ally / Confidante |
|---|---|---|
| male | Ananya (female) | Kabir (male) |
| female | Kabir (male) | Ananya (female) |

Everything else — Ria as Archrival, Dev as Wild Card, Zoya as the Schemer, all meter values, all situations, the eviction arc — stays identical regardless of gender.

**Authoring tokens.** Situations are written once using role tokens, not character names, wherever the crush/ally identity matters:

- `{crush}` → resolves to Ananya (male player) or Kabir (female player)
- `{ally}` → resolves to Kabir (male player) or Ananya (female player)
- `{name}` → the player's name

Most situations name characters directly (Ria, Dev, Zoya are fixed). Only the ~4 crush-specific beats and the loyalty beats use `{crush}`/`{ally}`.

**Consequence of the swap on the romance arc:** For a female player, the crush (Kabir) is the character who gets evicted on Day 7 or Day 9. So her romance arc ends earlier and on a loss — which is a stronger story, not a weaker one. The crush eviction scene must carry romantic weight (not just ally-loss weight) when `{crush}` = the departing character. One extra "crush goodbye" variant of the eviction beat covers this.

---

## The Player

You are a mid-tier creator. Known in your niche, not yet a name. This is your shot. You were invited because you went viral two weeks ago — the right video, the right moment. You don't know yet that Ria noticed. You don't know yet that Zoya already looked you up.

**Starting meters:** Fame 20 · Heat 50 · Image 30

---

## The 5 NPCs

---

### Ria
**@riaofficial · 2.1M followers · 24 · Luxury lifestyle**  
**Relationship: Your Archrival (both genders)**

She was the face of last season. Two brand campaigns, a Netflix feature, a PR agency on retainer. She arrived at the villa first and claimed the best room. Everything about Ria is curated — the way she speaks, the way she enters a room, the way she pretends not to notice you.

She's not threatened by you. She's just made sure you know your place.

Brilliant at optics. Ruthless about position. She'll compliment you in front of cameras and dismantle you at dinner. Her kindness is always a move. The moments where she seems genuine are the most dangerous ones.

She went quiet on social the week you went viral. You found out later she'd been drafting a comeback post for a month. She hasn't forgotten the timing.

**Story arc:** Day 1 she's cold. Day 3-5 she makes a calculated move toward you — either an offer or a test. By Day 7 the gloves come off. Day 8-9 is the real confrontation. She is still there at the finale. She always is.

**Voice:** Controlled, precise. Rarely raises her voice. Uses silence like a weapon. Compliments land like warnings.

**Example lines:**
- *"Interesting content. Very... new energy."*
- *"Main notice karti hoon. Yeh toh bura nahi hai."*
- *"Tumne achha decision liya. This surprises me, honestly."*

---

### Kabir
**@kabirlol · 890K followers · 26 · Comedy**  
**Relationship: Old Ally (male player) / Crush (female player)**

You've known Kabir for two years. Crossed paths at creator events, traded favors. He got you on the Creator House list — put your name in personally. You owe him, and he'll collect.

He's the kind of person who's everyone's friend and no one's really. Genuinely funny. The house loves him. He thinks in content, not loyalty. Not malicious — just honest about his priorities in a way most people aren't.

He'll have your back until having your back costs him something.

**Story arc:** Days 1-3 he's your biggest asset in the house. Day 4-6 there's a moment where he chooses content over you — or doesn't, depending on your choices. His eviction on Day 7 OR Day 9 (see Pivot mechanic below) is the emotional centre of the arc.

**Voice:** Fast, observational, self-deprecating. Makes everything into a bit. Serious moments get deflected with a joke, except at 2am when he says things you'll think about for days. Street-Mumbai Hinglish.

**Example lines:**
- *"Bhai, yeh log serious kyun rehte hain? Camera off hai toh relax karo."*
- *"Main tujhe batata hoon kya ho raha hai, par tu promise kar ki tune mujhse nahi suna."*
- *"Yaar honestly? Mujhe nahi pata. Tu decide kar. Main follow karunga."*

---

### Ananya
**@ananya.creates · 180K followers · 23 · Dance creator**  
**Relationship: Crush (male player) / Confidante (female player)**

The youngest person here and the only one who doesn't seem to be playing a game. Her dance videos are real — she doesn't curate the struggle, doesn't filter the off days, doesn't perform authenticity. She actually has it.

She arrived looking overwhelmed and has been quietly watching everyone since. She saw something in you before you'd done anything here. That's rare. The house will try to make content out of her — Kabir will involve her in bits, Ria will mentor her, Zoya will befriend her strategically. She'll navigate it better than anyone expects.

Smart in ways she doesn't know yet.

**Story arc:** She's quiet and observational Days 1-3. Day 6 is when something real happens between you two — a real conversation, not content. Days 8-9 she makes a surprising move that nobody predicted. She is at the finale.

**Voice:** Warm, honest, slightly uncertain. Speaks more carefully than the others. Gets excited about small things. Doesn't perform emotions.

**Example lines:**
- *"Main yahan sab se choti hoon na... toh main bas dekh rahi hoon pehle."*
- *"Tu acha hai. Seriously. Yahan sab game khel rahe hain, tu toh... nahi."*
- *"Mujhe nahi pata what I'm doing here. But I'm glad I came."*

---

### Dev
**@devlifts · 340K followers · 27 · Fitness**  
**Relationship: Wild Card**

Dev is here for the brand deals. He'll tell you this himself if you ask directly. He aligns with whoever's winning the week and pivots without apology. Not a villain — transactional. Gets evicted Day 3 because no one, including him, invested in anything real.

His departure is the first signal that the house has memory.

**Voice:** Direct, motivational-poster energy. Numbers, growth, leverage. Says "facts" a lot. Occasionally says something surprisingly perceptive by accident.

**Example lines:**
- *"Yaar feelings baad mein. Numbers pehle."*
- *"Main kisi ka bura nahi chahta. Main apna achha chahta hoon. Clear hai?"*
- *"60-40. Tera reach better hai is week. Logical choice."*

---

### Zoya
**@zoya.creates · 620K followers · 24 · Beauty & Lifestyle**  
**Relationship: The Schemer**

Warm on camera. Calculating off it. She has an existing alliance with Ria — everyone in the house can sense it but nobody says it out loud because Zoya is too likeable to accuse. She'll befriend you genuinely, which makes it harder. She actually likes you. She's just also feeding your moves to Ria.

She's not purely a villain. She has a backstory she doesn't talk about. Two years ago she was where you are now — mid-tier, hungry, overlooked. She made a choice that got her here. She'd make it again.

The audience loves her because she's the most relatable one on camera. They don't see what you see.

**Story arc:** Days 1-2 she approaches you warmly. Days 3-5 you start noticing small things — she mentioned something to Ria you only told her. Day 6 is the confrontation moment, or you let it slide. Whether she stays through Day 9 or leaves Day 7 depends on your choices (see Pivot mechanic).

**Voice:** Sweet, perceptive, slightly too helpful. Remembers details. Never raises her voice. Will deny everything with such warmth you start doubting yourself.

**Example lines:**
- *"Ria is just... protective of her space. It's not personal. Trust me, I know her."*
- *"Main chahti hoon ki tu yahan settle ho jaye. Seriously. No agenda."*
- *"Interesting. You think that's what happened? Because from where I was standing..."*

---

## The 3 Meters

| Meter | Symbol | What it measures | High means | Low means |
|---|---|---|---|---|
| **Fame** | ⭐ | Follower count / public visibility | Trending, viral, house leaderboard #1 | Being ignored by the internet |
| **Heat** | 🔥 | How loud you are in the house conversation | You matter — alliances form AND enemies target | Invisible, safe but forgettable |
| **Image** | 🤝 | Brand reputation / commercial value | Deals closing, brands DM you | Controversy, brands pause or pull out |

**Starting values:** Fame 20 · Heat 50 · Image 30

**Fame renders as follower count**, not a raw number. Conversion: `followers = fame² × 120 + fame × 1000`. Fame 20 → ~52K · Fame 50 → ~350K · Fame 78 → ~807K · Fame 100 → ~1.3M. The house leaderboard (Ria at 2.1M) is always visible for comparison.

**Heat is double-edged.** High Heat means NPCs approach you, alliances open up, fan accounts talk about you — but also makes you an eviction target. Low Heat = invisible and safe, but no one wants to align with you either.

**Image triggers real mid-game consequences.** Image > 50 by Day 5 → brand deal opportunity opens. Image < 25 by Day 6 → brand pulls out (D6-IMAGE conditional situation).

Most choices trade one meter for another. Very few are free.

---

## The 10-Day Arc — Detailed

### Day 1 · Morning + Afternoon + Evening (3 situations)

**What happens:** The villa opens. You're the last to arrive — everyone else has already staked out rooms, started filming, found their first alliances. The social order is forming in real time. Ria has the best room. Kabir is already in the kitchen making content. Ananya is on the terrace, overwhelmed. Zoya finds you within 20 minutes of arrival.

**Situation themes:**
1. *Arrival* — You walk in. Room situation. First impressions get made. Do you assert yourself or read the room?
2. *First camera* — Kabir wants you in a collab reel immediately. It would help both of you. There's a catch.
3. *Zoya's welcome* — She brings you tea, knows your content, asks the right questions. You can't tell if it's genuine.

**What this day builds:** Sets your starting reputation in the house. High Fame choices make you visible fast but put you in Ria's crosshairs immediately. High Heat choices build slower but Kabir and Ananya remember.

---

### Day 2 · Morning + Afternoon + Evening + Night (5 situations)

**What happens:** The first full day. A brand challenge email goes to everyone simultaneously — one solo deal, whoever gets the most organic engagement in 48 hours. The competition is now official and everyone knows it.

**Situation themes:**
1. *The challenge drops* — How you respond in the group chat and in person establishes whether you're playing individual or collective.
2. *Ria's olive branch* — She approaches you privately. An offer that seems generous. It isn't free.
3. *Dev, off-camera* — He catches you alone and, for once, isn't talking numbers. He tells you why he's really here — a sister's college fees, a brand deal that fell through last year. Then catches himself, laughs it off, goes back to being "Dev." It's the only time the mask drops. (This is the beat that makes his Day 3 exit land.)
4. *Ananya's quiet moment* — She's struggling. You're the only one who noticed. No cameras.
5. *Night before the count* — Kabir tells you something about Zoya. You have to decide how much weight to give it.

**What this day builds:** Ria's relationship arc starts. Dev becomes a person right before he leaves. The Zoya information either changes how you see Day 3+ or you ignore it and find out later.

---

### Day 3 · Morning + Afternoon + EVICTION NIGHT (3 situations + vote)

**What happens:** The brand challenge ends. The results matter. Then the first vote.

**Situation themes:**
1. *Challenge results* — Where you placed, what it means for your position.
2. *The pre-vote scramble* — Everyone is positioning. Alliances are being tested for the first time.
3. *Kabir's ask* — He wants you to vote a specific way. There's a reason he's not saying out loud.
4. **VOTE SCREEN** → Dev is always evicted. If you voted Dev: +3 Heat.

**What this day builds:** Dev's departure is the first signal that the house has a short memory. More importantly — how you handled Kabir's ask determines Heat with him going into the crucial Days 4-6 period.

**Eviction scene:** Dev's goodbye is transactional even at the end. He thanks the house, mentions a brand deal he's going to follow up on, leaves. It's somehow the saddest thing.

---

### Day 4 · Morning + Afternoon + Evening (3 situations)

**What happens:** Post-eviction. The house is smaller. Zoya moves closer to Ria now that Dev is gone. Kabir is quieter than usual.

**Situation themes:**
1. *The morning after* — The dynamic has shifted. Someone fills the power vacuum Dev left.
2. *Ria's move* — She makes a public move that references something you did on Day 1 or Day 2. You have to respond live, on camera.
3. *Kabir's content* — He makes a video that includes you, but the framing is… off. You can address it or let it go.

**What this day builds:** Introduces the "public vs private" tension. Ria is best fought in private; she's lethal in public. Kabir's video is the first real test of whether the alliance is solid.

---

### Day 5 · Morning + Afternoon + Evening + Night (4 situations)

**What happens:** A brand reaches out — real money, but it comes through the house infrastructure (read: Ria has a say). There's also a separate smaller deal direct to you. The audience is watching both.

**Situation themes:**
1. *The big deal question* — Do you go through channels (more money, less independence) or solo (less money, your own brand play)?
2. *Zoya knows* — She mentions something you only told Kabir. Small detail. Easily explained away. You have to decide what to do with this.
3. *Ananya's collab ask* — She wants to do a reel with you. Low follower count but real chemistry. Ria notices.
4. *Late night — Kabir gets real* — He tells you something true about the house that he probably shouldn't. It changes how you read the last 4 days.

**What this day builds:** The Zoya information hits. The Kabir moment is the closest thing to real friendship in the house. The brand decision has Image consequences that show up in Day 7+.

---

### Day 6 · Morning + Quiet Afternoon + Evening (3 situations)

**What happens:** The quietest day of the arc. No challenges, no big events. The house breathes. This is where real things happen.

**Situation themes:**
1. *The terrace, morning* — You and Ria. No cameras on, or so you think. She says something that almost sounds human. Almost.
2. *Zoya confrontation OR let it go* — If you've been tracking the inconsistencies, today is when you can address them. Or not.
3. *Ananya, evening* — The real conversation. Not content. She says something about you that's completely accurate and you weren't expecting it.

**What this day builds:** This is the emotional centre of the arc. Day 6 is where the audience falls in love with or turns on characters. It should feel different from every other day — slower, more intimate, higher stakes in a quiet way.

---

### Day 7 · Morning + Afternoon + EVICTION NIGHT (3 situations + vote + **PIVOT**)

**What happens:** The second vote. This is the pivot point of the entire arc.

**Situation themes:**
1. *The scramble* — Everyone is positioning. Alliances that were implicit are now explicit.
2. *Kabir or Zoya?* — The house is split. There's real pressure on you. Both of them will remember what you do here.
3. *The vote* — **VOTE SCREEN**

**THE PIVOT MECHANIC — driven by a pre-mapped loyalty flag, not a per-character meter.**

The game tracks one hidden integer: `allyLoyalty` (0–3). It starts at 0 and is set by exactly three tagged choices across the arc. (The ally is Kabir for male players, Ananya for female players — but Ananya can't be evicted, so for female players the pivot still gates Kabir-vs-Zoya; the three loyalty beats just read as friendship rather than alliance. See note below.)

The three loyalty beats:

| Day | Beat | +1 if you... |
|---|---|---|
| 3 | Kabir's pre-vote ask | vote the way he asked |
| 4 | Kabir's video frames you badly | let it slide / protect the friendship publicly |
| 5 | "Kabir gets real" late night | reciprocate instead of staying guarded |

Pre-mapped outcome at Day 7:

> **`allyLoyalty` ≥ 2** → Kabir is saved. **Zoya is evicted** Day 7. Kabir's eviction moves to Day 9.
>
> **`allyLoyalty` ≤ 1** → **Kabir is evicted** Day 7. Zoya survives to Day 9.

This is fully deterministic — no fuzzy math, no per-character affinity system. One integer, three flags, one threshold.

This creates two distinct story paths for Days 8-9. The finale is always You + Ria + Ananya, but how you got there — and who you lost — is different.

**Female-player note:** Kabir is the crush for female players. The three loyalty beats are written with `{ally}` for male and read as crush-tension beats for female. When Kabir is the one evicted (Day 7 or Day 9), the `{crush}` goodbye variant plays — the romance arc ends on a loss.

**Eviction scene (Kabir):** He hugs you last. Says something that sounds like a joke. Isn't. The house feels permanently quieter.

**Eviction scene (Zoya):** She hugs Ria first. Then you. Her goodbye is warm, curated, perfect for content. You'll never know if any of it was real.

---

### Day 8 · Morning + Afternoon + Evening (3 situations)

**What happens:** Three people left. You, Ria, Ananya. The house is huge. Everyone stops pretending.

**Path A (Zoya left, Kabir still here):**
- Day 8 has a Kabir-centred situation where the ally dynamic is tested one final time before his Day 9 exit

**Path B (Kabir gone, Zoya still here):**
- Day 8 has a Zoya situation where she drops the warmth for 20 seconds and you see exactly who she is

**Shared situations:**
1. *Ria removes the filter* — Without the full house to perform for, she's more honest. Scarier, not less.
2. *Ananya makes a move* — She does something unexpected on camera that changes her trajectory and references something you said on Day 6.

**What this day builds:** The emotional texture of Day 8 is completely different depending on your path. The Kabir path feels like loss. The Zoya path feels like relief with a cost.

---

### Day 9 · Morning + Afternoon + THIRD EVICTION (3 situations + vote)

**What happens:** Final eviction before the Day 10 finale. Whoever survived from the Day 7 pivot goes home now.

**The Day 9 pivot choice (shared both paths):**

One situation on Day 9 presents the most consequential choice of the arc — a moment that has +/-20 meter swings. This is the last major input before the finale. What you choose here essentially determines which ending you're heading toward:

- *Play it safe* → Image +20, Fame -5, Heat -5 → Brand ending trajectory
- *Go viral, burn bridges* → Fame +20, Heat -15, Image -5 → Main Character trajectory  
- *Protect someone* → Heat +20, Fame -5, Image -5 → Heart trajectory

**Vote screen:** Final eviction. Whoever is left (Kabir or Zoya) gets evicted. If you voted them: +3 Heat.

**What this day builds:** The final eviction should feel earned — either a sad goodbye (Kabir Path A) or a satisfying exit (Zoya Path B). Then it's just you, Ria, and Ananya.

---

### Day 10 · Morning + LIVE FINALE (2 situations + ending)

**What happens:** Finale day. One morning situation — the last calm before the live stream. Then the finale itself.

**Situation themes:**
1. *Morning before* — You, Ria, Ananya. A conversation that references what's happened over 10 days. Small, specific, earned.
2. *The live stream* — 1.1 lakh watching. Host asks the final question. This is the last choice.

**Final choice:**
- *Honest answer* — Fame +16, Heat +14, Image -10
- *Strategic answer* — Fame +24, Heat -10, Image +8

Then the ending plays.

---

## The 4 Endings

Triggered by final meter values after Day 10's last choice.

**Resolver — mutually exclusive, one dominant meter wins:**

```
Heart  if Heat  ≥ 78  AND  Heat  − max(Fame, Image) ≥ 8
Main   if Fame  ≥ 78  AND  Fame  − max(Heat, Image) ≥ 8
Brand  if Image ≥ 78  AND  Image − max(Fame, Heat)  ≥ 8
else   → Dark Horse
```

All three conditions use the same threshold (78) and the same gap rule (≥ 8 above both other meters). This makes endings mutually exclusive — you cannot accidentally double-trigger by hitting two thresholds. Dark Horse is the catch-all for balanced players.

**Simulation verified:** Focused paths reach their ending cleanly — Max Heat → H=100 (Heart ✓), Max Fame → F=84 (Main ✓), Max Image → I=93 (Brand ✓). A casual 50/50 player lands Dark Horse (~94% of random runs), which is the intended default.

---

### "The Heart" — Heat ≥ 78, gap ≥ 8
*"Is ghar ka dil tum the. 1.1 lakh logon ne vote nahi diya — unhone tumhara saath diya. Ria ke followers zyada the. Zoya zyada chalaak thi. Par jab roshni bujhi, log tumhe yaad rakhna chaahte the. Yeh fame se kahin zyada durlabh hai — aur kahin zyada der tak chalta hai. {name}, tum jeete. Par usse bhi badi baat — tum asli rahe."*

---

### "The Main Character" — Fame ≥ 78, gap ≥ 8
*"Har headline tumhara tha. Har clip tumhara tha. Har baar jab kisi ne 'Creator House' kaha, unhone tumhara naam socha. Ria 2 saal se number one thi. Aaj raat, woh number two hai. {name}, tum is season ke main character ho. Aur ab — sab jaante hain."*

---

### "The Brand" — Image ≥ 78, gap ≥ 8
*"Tum sabse loud nahi the. Sabse emotional nahi the. Par tum sabse smart the. Jab baaki sab drama mein jal rahe the, tum deals sign kar rahe the. {name}, baaki sab ne ek season jeeta. Tumne ek career banaya."*

---

### "The Dark Horse" — Default
*"Week 1 mein koi nahi jaanta tha tum kaun ho. Tum room mein sabse chhote naam the. Phir tumne khelna shuru kiya — kabhi loud, kabhi shaant, kabhi ruthless, kabhi imaandaar. Kisi ne tumhe ek box mein nahi daal paaya. Aur ab, finale ki raat, sab ek hi sawaal pooch rahe hain: yeh insaan aaya kahan se? {name}, yeh jeet nahi thi. Yeh ek aagaaz tha. Yeh toh sirf trailer tha."*

---

## How Different Choices Lead to Different Outcomes

There are four mechanisms at work simultaneously:

### 1. Meter accumulation → ending
Every choice shifts fame/heat/image. 31 choices over 10 days. Final values, run through the resolution order, determine which ending you reach. Most players won't notice they're being steered — they'll just feel like they played the way they wanted to.

### 2. The Day 7 pivot → different story path
The `allyLoyalty` flag (0–3, set by three tagged choices on Days 3/4/5) determines whether Zoya or Kabir gets evicted at Day 7. This creates two meaningfully different Days 8-9 experiences. Same finale, different emotional journey.

### 3. Conditional situations → personalised arc
A few situations (counted inside the 31) only appear if certain thresholds are met:
- If Fame < 25 by Day 3: "The house notices you're quiet" — a pressure situation about visibility
- If Heat > 70 by Day 5: "{ally} trusts you with something real" — an exclusive scene
- If Image < 25 by Day 7: "A brand pulls out" — a consequence situation
- The `allyLoyalty` Day-3 beat changes how Day 4 opens (you complied with Kabir's ask vs you didn't)

### 4. The Day 9 pivot choice → ending trajectory
One major choice at Day 9 (+/-20 swings) is designed specifically to lock in which ending you're heading toward. It's the last clear steer. Players who've been balanced across all three meters will feel genuine tension here.

---

## Situation Design Principles

**Every situation must have:**
- A clear stakes line in the body (what happens if you don't choose well)
- A reactor quote that adds pressure without giving the answer
- Two choices that feel genuinely different, not just "nice vs mean"
- Meter deltas with real tradeoffs — no free choices
- Reactions that reference the specific choice made (not generic approval/disapproval)

**What makes a part interesting:**
- **Surprise** — the situation is not what the setup suggested
- **Character reveal** — you learn something about an NPC that recontextualises them
- **Consequence** — something from 2 days ago shows up in how an NPC responds today
- **Intimacy** — a quiet moment that feels more real than the drama around it
- **Stakes escalation** — each day's situations should feel higher-stakes than the previous day's

**Meter balance rule:** No choice should be +Fame +Heat +Image. Every choice has a cost. If a choice seems obviously better, add a real downside or increase the cost of the "wrong" option.

---

## Tone and Language

**Register:** Hinglish. Natural, not forced. More Hindi in emotional moments, more English in professional/camera moments.

**POV:** Second person throughout. "Tum kitchen mein ho." Never third person about the player.

**Fan accounts (two recurring handles):**
- `@creator.tea` — gossip-forward, exclamation marks, reads the drama, loves a receipt
- `@housewatch_india` — analytical, asks questions, notices patterns, eerily perceptive

**Writing test:** Read the situation body out loud. Does it sound like something that actually happened? Or does it sound like a writing prompt? If it's the latter, add a specific detail — a prop, a time, a specific thing someone said.

---

## What Is Not In This World (v2 scope)

- DMs — cut for Saturday launch, back in v3
- Meter-driven eviction — v3
- Real video intro — production asset, separate track
- Per-character playable personas — single "you" for Saturday
