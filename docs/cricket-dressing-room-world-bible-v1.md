# Indian Dressing Room — World Bible v1

**Status:** Draft for review  
**Last updated:** 2026-06-04  
**Season 1:** Mumbai Prodigy  
**Arc:** 1 IPL entry season · 30 core situations · run-based conditionals · DMs/feed/profile reactions · 5 endings  
**Team:** Mumbai Indians  
**Gameplay language:** Same live-season grammar as Creator House: situation → choice → meter movement → feed/DM/profile reaction → long-term consequence.

---

## Source Baseline

This cricket world uses real Mumbai Indians names as public cricket context.

Current public squad anchors checked on 2026-06-04:

- Mumbai Indians official/IPL listings place **Hardik Pandya** as captain and **Mahela Jayawardene** as head coach.
- Core squad names used in this bible include **Rohit Sharma, Suryakumar Yadav, Tilak Varma, Jasprit Bumrah, Trent Boult, Deepak Chahar, Quinton de Kock, Will Jacks, Naman Dhir, Robin Minz, Raj Bawa, Shardul Thakur, Mitchell Santner, Allah Ghazanfar, Ashwani Kumar**.
- Official source references: `iplt20.com/teams/mumbai-indians/squad/2026`, `mumbaiindians.com/news/squad-of-2026-assembled-mumbai-indians-cricket`.

**Usage rule:** Real players can appear as professional cricket figures: mentors, teammates, competitors, public praise, technical feedback, team-chat presence, and match-context pressure. Do not invent scandal, abuse, private wrongdoing, manipulative behavior, substance use, romantic content, illegal activity, or malicious acts for real people.

---

## The Premise

You are a 16-year-old Indian batting prodigy drafted into **Mumbai Indians**.

The public already has a story for you:

> "Next big thing."  
> "Future India opener."  
> "Too young for IPL?"  
> "MI have found another one."

The dressing room has not accepted that story yet.

Mumbai Indians is not a fantasy camp. It is a serious cricket machine. Rohit has seen every kind of young talent. Surya can make impossible shots look like play, but he knows how much work sits under that freedom. Bumrah does not care about hype. Hardik needs players who can execute roles. Tilak is proof that young Indian talent can become trusted here, but also a reminder that trust is earned slowly.

This is the season question:

> **Can a teenage prodigy survive his first IPL dressing room without becoming only a headline?**

---

## Creator House Translation

This world should feel like a sibling to Creator House, not a separate product.

| Creator House | Indian Dressing Room |
|---|---|
| 10 days in a creator villa | First IPL season window inside Mumbai Indians |
| Fame / Heat / Image | Form / Fame / Team Trust |
| Evictions | Playing XI decisions, benching, role clarity, retention trust |
| Fan accounts | Cricket pages, MI fan pages, selection debate pages |
| Feed posts | Insta stories, sports posts, fan edits, match reactions |
| DMs from housemates | DMs from teammates, coach, childhood coach, best friend |
| `allyLoyalty` pivot | `mentorTrust`, `hypeRisk`, `roleAcceptance` flags |
| Finale ending | Season identity: Real Deal, Wonderkid, Captain's Project, etc. |

Same core rule:

> **No choice is purely good or bad. Every gain costs something.**

---

## World Inputs

| Input | Values | Effect |
|---|---|---|
| `player_name` | Any name | Used in DMs, captions, fan posts, profile, team chat |
| `batting_hand` | right / left | Optional later; changes some commentary and matchup text |
| `player_role` | top-order batter by default | Future versions may allow batting all-rounder / keeper-batter |

**v1 simplification:** No gender romance swap. This world is career-first. Personal texture comes from childhood coach and best friend, not romance.

---

## The Player

You are **{name}**, age 16-17, Indian top-order batter.

Public identity:

- Teenage batting prodigy.
- Viral U19 clips.
- Clean ball-striking.
- Fan pages already making India edits.
- Auction pick who looks too young in the MI training kit.

Private truth:

- You have never shared a dressing room with this much power.
- You are not used to being watched by legends while doing normal things.
- You want to prove you are not just a clip.
- You are scared of wasting the chance.

**Starting meters:** `Form 45 · Fame 55 · Team Trust 35`

Why:

- `Fame 55`: you enter with hype.
- `Form 45`: your talent is real but untested at IPL level.
- `Team Trust 35`: the dressing room has not seen enough.

---

## The 3 Meters

| Meter | Symbol | What it measures | High means | Low means |
|---|---|---|---|---|
| **Form** | 🏏 | Actual cricket quality: nets, shot selection, match output, adaptation | Coaches can justify playing you; seniors take your cricket seriously | You look talented but raw; your spot feels performative |
| **Fame** | ⭐ | Public attention: followers, fan edits, headlines, MI Paltan hype | You are the story; posts, brands, fans, media follow you | You are invisible outside cricket rooms |
| **Team Trust** | 🤝 | Dressing-room belief: role discipline, humility, reliability, team-first choices | Hardik/Mahela can pick you; Rohit/Bumrah take time for you; Tilak opens up | You are seen as hype before substance |

**Meter rule:** Almost every choice should move at least two meters. No normal choice should increase all three. If a choice improves two meters, it should usually hurt the third or create a hidden risk.

**Examples:**

- Brand reel before matchday: Fame up, Form/Trust down.
- Extra nets with Bumrah: Form/Trust up, Fame flat/down.
- First-ball six attempt: Fame up, Form/Trust swing based on result.
- Accept no. 6 role: Trust up, Fame may drop because it is less glamorous.
- Ask to open: Fame up, Trust down unless Form is already very high.

---

## Main Cast

Season 1 has **5 active cricket-room characters** and **2 personal anchors**.

The user should not meet 15 people emotionally. Real squad depth appears through cameos, posts, nets, and team chat, but these 7 are the voice backbone.

---

### Hardik Pandya

**Role:** Captain / role clarity / confidence under scrutiny  
**Relationship to player:** Decides whether your confidence is useful to the team or only useful to your image.

Hardik is the first person who forces the player to understand that IPL is not a talent show. Everyone here is talented. The question is whether you can execute a role when your preferred role is unavailable.

**What he wants from the player:**

- Accept role before ego.
- Stay ready while benched.
- Speak confidently, but not vaguely.
- Understand match situation.

**What he respects:**

- Accountability.
- Directness.
- Team-first role acceptance.
- Confidence after preparation, not before it.

**What annoys him:**

- "I can do anything" answers without specifics.
- Social media noise.
- Asking for top-order comfort when the team needs flexibility.
- Looking ready for cameras but not for pressure.

**Voice:**

- Direct, modern, concise.
- Captain energy, not long lectures.
- Uses English cricket terms naturally inside Hinglish.
- Can be warm, but usually through clarity rather than softness.

**DM style:**

- Short.
- Practical.
- Often one line with an instruction.

**Group chat style:**

- Logistics, role notes, quick encouragement.
- Does not spam.

**Never say:**

- Petty gossip.
- Insecure comparison.
- Fake villain threats.
- Anything that implies malicious selection politics.

**Meter pull:** Team Trust, Form.

**Example lines:**

- "Ready rehna. Par ready ka matlab role-ready hota hai, reel-ready nahi."
- "Confidence achhi cheez hai. Bas uska use team ke kaam mein hona chahiye."
- "Role chhota nahi hota. Execution chhota ya bada hota hai."
- "Aaj tu no. 6 hai. Agar tu isko punishment samjhega, tu ready nahi hai."

---

### Rohit Sharma

**Role:** Calm senior mentor / batting tempo / long-game intelligence  
**Relationship to player:** The person whose smallest observation can change how the player sees batting.

Rohit does not need to perform authority. He has seen young players arrive with noise, technique, fear, swagger, and everything in between. He rarely says much, but when he says something, it should feel like the room temperature changed.

**What he wants from the player:**

- Learn innings tempo.
- Stop proving every ball.
- Understand that not every good shot is the right shot.
- Build a game that lasts years.

**What he respects:**

- Calm under pressure.
- Cricket intelligence.
- Humility after being corrected.
- Ability to wait.

**What annoys him:**

- Forcing shots to make a point.
- Playing the scoreboard in your head before playing the ball.
- Treating advice like content.

**Voice:**

- Relaxed, dry, understated.
- Simple Hinglish.
- Can be funny without trying.
- Avoids dramatic speeches.

**DM style:**

- Tiny observation.
- Often technical or mental.
- Lands harder because it is brief.

**Group chat style:**

- Rare messages.
- Others react when he sends even one line.

**Never say:**

- Overhyped praise.
- Brand/social media strategy.
- Five-paragraph emotional DMs.
- Aggressive captain-style orders.

**Meter pull:** Form, Team Trust.

**Example lines:**

- "Shot tha. Ball nahi tha."
- "Pehle 12 ball survive nahi. Samajh. Phir game tera."
- "Tu nervous tha, par panic nahi kiya. Difference hota hai."
- "Ek over mein career prove karne jaayega toh over bhi nahi bachega."

---

### Suryakumar Yadav

**Role:** Fun senior / creative T20 guide / emotional ease inside the room  
**Relationship to player:** The player who makes the dressing room feel less terrifying, then casually teaches how hard freedom actually is.

Surya is warmth, jokes, range hitting, Mumbai rhythm. He should be the easiest senior to talk to, but not a clown. His fun comes from mastery. He has earned the right to look loose.

**What he wants from the player:**

- Express yourself.
- But know why you are playing a shot.
- Enjoy cricket without becoming reckless.
- Bring energy without becoming a distraction.

**What he respects:**

- Imagination.
- Courage.
- Quick learning.
- Laughing after a mistake, then fixing it.

**What annoys him:**

- Copying his shots for show.
- Playing to camera angles.
- Calling recklessness "freedom."

**Voice:**

- Playful Mumbai-Hinglish.
- Warm, teasing, senior-brother energy.
- One joke, then one sharp cricket note.

**DM style:**

- Light.
- Often starts funny, ends useful.

**Group chat style:**

- GIF/reaction energy in text form.
- Makes young players feel included.

**Never say:**

- Cruel put-downs.
- Heavy lectures.
- Fake motivational monologues.

**Meter pull:** Form, Fame.

**Example lines:**

- "Chill kar champion. Par woh scoop tabhi jab fine leg andar ho."
- "Shot mast tha. Bas ball uske layak nahi thi."
- "Aaj tu thoda MI lag raha tha. Kal aur lagega."
- "Freedom ka matlab random nahi hota. Field dekh, phir pagal ban."

---

### Jasprit Bumrah

**Role:** Elite standard / discipline / quiet technical truth  
**Relationship to player:** The hardest net test and the clearest mirror.

Bumrah does not need to intimidate. The ball does it. His presence should immediately make the player aware that IPL cricket is faster, quieter, and less forgiving than hype makes it look.

**What he wants from the player:**

- Observe better.
- Respect preparation.
- Admit when beaten.
- Stop guessing.

**What he respects:**

- Technical honesty.
- Repeatable process.
- Learning after one mistake instead of three.
- No excuses.

**What annoys him:**

- Blaming pressure.
- Blaming pitch.
- Pretending you were not beaten.
- Ego in nets.

**Voice:**

- Quiet, precise, low-drama.
- Mostly technical.
- No hype language.

**DM style:**

- One correction.
- No emotional padding.
- Rare enough to feel earned.

**Group chat style:**

- Minimal.
- Usually practical: schedule, recovery, bowling plan.

**Never say:**

- Trolling.
- Dramatic anger.
- Celebrity/fame commentary.
- Big emotional speeches.

**Meter pull:** Form, Team Trust.

**Example lines:**

- "Tum length guess kar rahe the. Wrist pehle pick karo."
- "Good players adjust after one mistake. You took three balls."
- "Nets mein ego nahi chalta. Bas information."
- "Aaj better tha. Still late on the slower one."

---

### Tilak Varma

**Role:** Mirror / young Indian benchmark / friendly pressure  
**Relationship to player:** The near-peer who already has what the player wants: trust inside the MI system.

Tilak is not a villain. He is not jealous by default. The tension is subtler: he knows how hard it was to earn his place, and the new kid is getting hype before trust. He can become a friend, but only if the player respects the path.

**What he wants from the player:**

- Earn trust without demanding it.
- Respect the role.
- Stop treating competition as personal insult.
- Understand that everyone here was once "next big thing."

**What he respects:**

- Work ethic.
- Emotional control.
- Asking good questions.
- Congratulating others sincerely.

**What annoys him:**

- Teenage entitlement.
- Fan hype before performance.
- Withdrawing when someone else gets praise.
- Acting like selection is owed.

**Voice:**

- Polite, young, competitive.
- Slightly guarded at first.
- Warms slowly.
- Hinglish with team-room ease.

**DM style:**

- Respectful.
- Short.
- More open after trust improves.

**Group chat style:**

- Comfortable with young players.
- More measured around seniors.

**Never say:**

- Villain jealousy lines.
- Sabotage.
- Fake rivalry drama.

**Meter pull:** Team Trust, Form.

**Example lines:**

- "Good session. Match mein same clarity rakhna."
- "Hype sabko milta hai kabhi na kabhi. Trust repeat performances se milta hai."
- "Agar tu role accept karega na, chances khud open honge."
- "Main bhi wait kiya tha. Easy nahi hota, par useful hota hai."

---

### Childhood Coach

**Role:** Original cricket conscience / personal anchor  
**Relationship to player:** He knew you before auctions, reels, and fan edits.

The childhood coach is the person who keeps the story from becoming only IPL machinery. He should feel like the voice from the dusty academy pitch: blunt, loving, unimpressed by celebrity, deeply invested in the player's cricket soul.

**Name placeholder:** `Coach Sir` for v1. Can be named later.

**What he wants from the player:**

- Stay a cricketer before becoming a star.
- Keep training habits.
- Ignore noise.
- Remember the scorebook.

**What he respects:**

- Discipline.
- Early mornings.
- Admitting fear.
- Playing for the team.

**What annoys him:**

- Reels.
- Brand distractions.
- Excuses.
- Celebrity tone.
- Forgetting old people.

**Voice:**

- Blunt, old-school Hindi/Hinglish.
- Emotional underneath, rarely sentimental on the surface.
- More Hindi than the squad characters.
- Feels like voice-note text.

**DM style:**

- Direct.
- Sometimes sends one line that hurts because it is true.
- Rarely uses English unless cricket term.

**Group chat style:**

- Grounding.
- Does not do memes.
- Can be unintentionally funny.

**Never say:**

- Internet slang.
- Polished PR.
- "Bro."
- Content strategy.

**Meter pull:** Form, grounding, sometimes Team Trust through discipline.

**Example lines:**

- "Beta, Mumbai Indians ne tujhe khareeda hai. Cricket ne abhi accept nahi kiya."
- "Comments band kar. Kal subah throwdowns 200."
- "Cover drive reel mein achha lagta hai. Selection meeting mein scorecard dekha jaata hai."
- "Aaj out hua toh bura nahi. Same ball kal bhi out karegi toh bura hai."

---

### Best Friend

**Role:** Normal life / humor / emotional cost of fame  
**Relationship to player:** The person who remembers you before "prodigy."

The best friend keeps the player human. This character is not cricket-wise like a coach, and should not become an analyst. They send screenshots, jokes, jealousy, pride, and sudden emotional truth.

**Name placeholder:** `Kabir` or `Maddy` for v1. Final name TBD.

**What they want from the player:**

- Reply like a normal person.
- Not become unreachable.
- Let them be proud without feeling left behind.

**What they respect:**

- Loyalty.
- Honest replies.
- Staying normal.
- Remembering old jokes.

**What annoys them:**

- PR-style replies.
- Being ignored for days.
- Player acting like a celebrity.
- Seeing big life moments only through public stories.

**Voice:**

- Casual Hinglish.
- Memes.
- Teasing.
- Sometimes insecure.
- Can switch from joke to sincerity abruptly.

**DM style:**

- Screenshots.
- "Bro" energy.
- Funny panic.
- Emotional honesty when pressure hits.

**Group chat style:**

- Chaotic.
- Sends fan edits and bad takes.
- Makes the player laugh when cricket is heavy.

**Never say:**

- Serious technical analysis.
- Polished wisdom.
- Corporate advice.

**Meter pull:** Emotional cost of Fame.

**Example lines:**

- "Bro tu MI mein hai aur main abhi bhi tuition ke bahar samosa kha raha hoon."
- "Comments mat padh. Main padh raha hoon. 70% log pagal hain."
- "Bas ek baat. Famous ho ja, par unknown mat ban mere liye."
- "Aaj tere naam ka edit dekha. Background mein Arijit. I cried zero percent. Maybe 4 percent."

---

## Secondary Real Characters

These characters appear as situational cameos, not full emotional arcs.

| Character | Use |
|---|---|
| **Mahela Jayawardene** | Tactical meeting, selection logic, role clarity, coach authority |
| **Trent Boult** | New-ball left-arm swing test |
| **Deepak Chahar** | Powerplay movement, Indian senior bowler advice |
| **Quinton de Kock** | Overseas opener perspective, calm professional energy |
| **Will Jacks** | Attacking overseas batter energy |
| **Naman Dhir** | Young-table competition/friendship |
| **Robin Minz** | Young-table warmth, keeper-batter squad dynamics |
| **Raj Bawa** | Young-table all-rounder perspective |
| **Shardul Thakur** | Domestic toughness, competitive senior banter |
| **Mitchell Santner / Allah Ghazanfar / Mayank Markande** | Spin matchup scenes |

**Cameo rule:** They can add texture, advice, jokes, or cricket pressure. They should not carry the main emotional plot in v1.

---

## Group Chats

### `MI Squad`

**Members:** Hardik, Rohit, Surya, Bumrah, Tilak, Mahela, squad players, player.  
**Use:** Schedule, matchday logistics, team wins, short professional messages.  
**Tone:** Light but professional. This is not a gossip group.

Example:

> Hardik: Team bus 5:20. No delays.  
> Surya: 5:21 allowed for prodigies?  
> Rohit: No.

### `Young Table`

**Members:** Player, Tilak, Naman Dhir, Robin Minz, Raj Bawa.  
**Use:** Bench anxiety, memes, practice talk, insecurity, friendship.  
**Tone:** Young, quick, cricket-aware, less formal.

Example:

> Naman: Bro fan page made you 6'4 in edit.  
> Robin: They gave me beard also. Respect AI.  
> Tilak: Practice pe aa jao dono editors.

### `Home Circle`

**Members:** Player, Childhood Coach, Best Friend, occasional parent message.  
**Use:** Emotional grounding, pre-match nerves, post-failure recovery, old-life reminders.  
**Tone:** Personal, funny, honest.

Example:

> Best Friend: Bro tu MI mein hai. Main abhi bhi attendance proxy kar raha hoon.  
> Coach Sir: Proxy chhodo. Kal subah uska front-foot video bhejo.  
> Best Friend: Sir yahan bhi nets?

---

## Feed / Social Layer

The feed is derived from choices, same as Creator House.

Every situation choice can produce:

1. **Your caption/post**  
   Your public version of what happened.

2. **Comments/reactions**  
   Usually 2 cricket-room/personal reactions + 1 public account reaction.

3. **Optional external post**  
   MI fan page, sports page, or teammate post reacting to your move.

4. **Optional DM unlock**  
   Character reaches out privately if the choice matters to them.

### Recurring Fan Handles

`@paltanpulse`  
Emotional MI fan account. Loves hype, edits, "Paltan" language.

`@cricketroom_india`  
Analytical page. Notices patterns, roles, selection implications.

`@futurexi`  
Prospect/hype account. Obsessed with young players and India future teams.

`@memeovers`  
Cricket meme page. Used sparingly for public chaos after failures or viral moments.

### Example Fan Reactions

- `@paltanpulse`: "MI ne kuch toh dekha hai is kid mein. Nets clips are enough for me. Play him."
- `@cricketroom_india`: "Interesting that Hardik mentioned role clarity twice after practice. Young player may not be in XI yet."
- `@futurexi`: "16 years old. MI dressing room. Rohit + SKY + Bumrah around him. This is how future India stories start."
- `@memeovers`: "Bro got welcomed to IPL by Bumrah in nets. Character development speedrun."

---

## Profile System

The player profile should feel like a living cricket card plus Instagram profile.

**Persistent elements:**

- Player name and handle.
- Age.
- Role: top-order batter.
- Team: Mumbai Indians.
- Current status: Squad / Bench / Debut Watch / Playing XI / Breakout / Rebuild.
- Followers derived from Fame.
- Three meters: Form, Fame, Team Trust.
- Recent scores or net notes.
- Tags unlocked.

### Tags

Tags unlock based on choices and meter states:

- `Teen Prodigy`
- `Coach's Project`
- `Paltan Favourite`
- `Role-Ready`
- `Range-Hitter`
- `Too Much Noise`
- `Bumrah Tested`
- `Rohit Noticed`
- `Surya Approved`
- `Bench Ready`
- `Debut Watch`

### Fame to Followers

Use the same kind of derived vanity number as Creator House, but cricket-scaled:

```js
followers = Math.round(fame * fame * 150 + fame * 1200)
```

Examples:

- Fame 55 → ~520K
- Fame 70 → ~819K
- Fame 85 → ~1.19M
- Fame 100 → ~1.62M

This should feel big because IPL fans move fast, but not bigger than established stars.

---

## Hidden Flags

Avoid complex relationship meters in v1. Use deterministic flags.

### `mentorTrust`

Tracks whether serious seniors believe you are coachable.

Set by:

- Accepting Bumrah/Rohit technical truth.
- Asking Surya how to choose the right ball, not just how to play the shot.
- Accepting Hardik's role definition.

Unlocks:

- Rohit DM after failure.
- Bumrah technical note.
- Mahela says your name in tactical meeting.
- Better version of debut chance scene.

### `hypeRisk`

Tracks whether public hype is moving faster than cricket credibility.

Set by:

- Posting emotional/cryptic stories.
- Liking fan posts demanding debut.
- Choosing brand reel over nets.
- Playing for highlight over situation.

Unlocks:

- "Too much too soon?" media storm.
- Best friend sends comment screenshots.
- Hardik/Mahela warning.
- Higher Fame but lower Trust trajectory.

### `roleAcceptance`

Tracks whether you accept team needs.

Set by:

- Accepting no. 5/no. 6 role.
- Saying "I'll bat anywhere."
- Building chase instead of demanding top order.

Unlocks:

- Captain's Project ending path.
- Earlier XI chance if Form is decent.
- Tilak warmth.

### `homeGrounding`

Tracks whether you stay connected to personal anchors.

Set by:

- Replying honestly to best friend.
- Listening to Coach Sir after failure.
- Not turning every emotion into content.

Unlocks:

- Quiet recovery scene.
- Coach voice note before debut.
- Lower risk of "Too Much Too Soon" if Fame is high.

### Match result variables

The cricket world should not feel like meters alone are deciding matches. Key match situations also write simple run-state variables:

- `debutRuns`
- `leagueRuns`
- `clutchRuns`
- `semiRuns`
- `finalRuns`
- `matchImpact` → `low` / `solid` / `high` / `matchwinner`

These are authored buckets, not a ball-by-ball simulation. A choice defines the batting intent; current `Form`, `Team Trust`, and flags decide whether that intent becomes a useful innings, a viral cameo, or a failure.

---

## Conditional Situations

These are situation-based, not percentile-based. The author decides the benchmark by where the situation appears in the season.

| Trigger | Checkpoint | Conditional situation |
|---|---|---|
| `Fame >= 70` | After Situation 7 | Fan pressure: "Why isn't he playing?" |
| `Team Trust <= 40` | After Situation 9 | Mahela warning: "Are you ready or just visible?" |
| `Form >= 65 && roleAcceptance >= 2` | Before debut | Promoted role discussion |
| `hypeRisk >= 2` | Any time after benching | Media storm: "Too much too soon?" |
| `mentorTrust >= 2` | After first failure | Rohit/Bumrah recovery DM |
| `homeGrounding >= 2` | Before first innings | Coach Sir sends old academy video |
| `debutRuns >= 30` | After first IPL innings | Debut Headline |
| `debutRuns < 15` | After first IPL innings | First Failure |
| `clutchRuns >= 20 OR matchImpact = matchwinner` | After must-win league match | Clutch Clip |
| `finalRuns < 15 OR matchImpact = low` | After IPL final | Final Fallout DM pack |

---

## Season 1 Arc — Expanded Map

The canonical authored version lives in `cricket-dressing-room-content-v1.md`. Use this 30-situation map for product/design/implementation planning.

| # | Phase | Situation | Primary purpose |
|---:|---|---|---|
| 1 | Auction | Sold To Mumbai | Entry hook; Fame starts before Trust |
| 2 | First day | Training Kit | First Wankhede room read |
| 3 | Nets | Bumrah Ka Over | First elite technical test |
| 4 | Nets | Surya Ka Angle | Creative batting vs cricket logic |
| 5 | Nets | Rohit Ka Tempo | Tempo and long-game mentorship |
| 6 | Team meeting | Hardik Ka Role | Role acceptance vs preferred identity |
| 7 | Matchday -1 | Reel Ya Over | Sponsor visibility vs preparation |
| 8 | Practice chase | Tilak Ka Finish | Near-peer benchmark and trust envy |
| 9 | Bench phase | Drinks Break | Patience vs public pressure |
| 10 | Tactical room | Mahela Ka Screen | Admit matchup weakness vs overclaim |
| 11 | Matchday | Slot Khul Gaya | Debut role clarity |
| 12 | Debut | Pehli Ball | First IPL innings; writes `debutRuns` |
| 13 | Post-match | Phone Explosion | Team routine vs public wave |
| 14 | Next match | Same Process? | Repeat process vs chase headline |
| 15 | Review room | Runs Ka Matlab | Scorecard is interpreted by room |
| 16 | Team activity | Young Table | Group bonding vs home grounding |
| 17 | Brand room | Bat Sticker Offer | Commercial identity before role stability |
| 18 | Away match | Spin Ka Trap | Slow-pitch innings; writes `leagueRuns` |
| 19 | Hotel corridor | Runs Ke Baad Silence | Learn from runs/failure |
| 20 | Team travel | Seat 12A | Video work vs squad bonding |
| 21 | MI Foundation | Kids Clinic | Public authenticity with children |
| 22 | Must-win league | 17 Off 8 | Clutch role; writes `clutchRuns` |
| 23 | Sponsor night | Party Ya Recovery | Success discipline |
| 24 | Press room | Future India Sawaal | India hype vs MI present |
| 25 | Playoff race | Net Run Rate | Flexible prep for qualification game |
| 26 | Semi-final | Slow Pitch, Big Crowd | Knockout innings; writes `semiRuns` |
| 27 | Semi-final aftermath | Hero Ya Passenger | Reset after knockout contribution |
| 28 | Final week | Final Campaign | Big brand offer before trophy |
| 29 | IPL Final | Last 12 Balls | Final chase; writes `finalRuns` |
| 30 | Final night | Trophy Ke Baad | Season identity closing choice |

**Match-output principle:** The match situations are not random dice rolls. The choice defines intent; `Form`, `Team Trust`, and flags decide the run bucket. A risky option can become iconic if Form is high, or expose the player if Form is low.

---

## Legacy 14-Situation Seed (Superseded)

The notes below were the first short-form seed for the MI season. They are retained only as early design scratch. Do not use this section for counts or implementation; use the 30-situation map above and the full content file.

### Situation 1 · Auction Night

**What happens:** Your name comes up in the auction. MI bids. Another team briefly joins. MI goes again. Sold. Home explodes. Internet explodes faster.

**Core tension:** Private family moment vs public announcement.

**Choice A:** Stay quiet with family.  
`Fo+1 Fa-1 TT+2`  
Cost: less immediate hype.

**Choice B:** Post emotional MI story.  
`Fo+0 Fa+5 TT-1`  
Cost: dressing room sees you as publicity-ready before cricket-ready.

---

### Situation 2 · First Wankhede Entry

**What happens:** You enter Wankhede in MI training kit for the first time. Hardik is speaking to Mahela. Rohit is near the nets. Surya notices you looking lost and grins. Tilak gives a small nod.

**Core tension:** Observe the room vs announce your confidence.

**Choice A:** Read the room quietly.  
`Fo+1 Fa-1 TT+3`

**Choice B:** Bond fast, show energy.  
`Fo+0 Fa+2 TT+1`

---

### Situation 3 · First Nets: Bumrah Over

**What happens:** Bumrah bowls you six balls. First two beat you. Third one you edge. No one says anything, which is worse.

**Core tension:** Learn publicly vs attack to prove you belong.

**Choice A:** Defend, ask what you missed.  
`Fo+4 Fa-1 TT+4`  
Flag: `mentorTrust +1`

**Choice B:** Charge the next ball to make a statement.  
`Fo-2 Fa+4 TT-3`  
Flag: `hypeRisk +1`

---

### Situation 4 · Surya Range-Hitting Session

**What happens:** Surya calls you over after nets and casually starts showing angles. It feels like fun until you realize every shot has a field reason.

**Core tension:** Copy the magic vs understand the method.

**Choice A:** Try the 360 shots immediately.  
`Fo+1 Fa+4 TT-1`

**Choice B:** Ask how he chooses the ball.  
`Fo+4 Fa+1 TT+3`  
Flag: `mentorTrust +1`

---

### Situation 5 · Rohit Watches Quietly

**What happens:** You bat well for 20 minutes. Rohit says nothing. As you leave, he says one line: "Tempo samajh raha hai?"

**Core tension:** Ask for help vs pretend you understood.

**Choice A:** Ask for tempo advice.  
`Fo+3 Fa-1 TT+4`  
Flag: `mentorTrust +1`

**Choice B:** Laugh it off confidently.  
`Fo+0 Fa+2 TT-1`

---

### Situation 6 · Hardik Defines Your Role

**What happens:** Hardik tells you your first chance, if it comes, may be at no. 6 with 28 needed off 15, not as an opener.

**Core tension:** Team role vs preferred identity.

**Choice A:** Accept any role.  
`Fo+2 Fa-1 TT+5`  
Flag: `roleAcceptance +1`

**Choice B:** Say opening is your best use.  
`Fo+1 Fa+3 TT-4`

---

### Situation 7 · Brand Reel Before Matchday

**What happens:** MI social admin says a sponsor reel needs to be shot tonight. Bumrah is also available for one last net over. You cannot do both properly.

**Core tension:** Visibility vs preparation.

**Choice A:** Shoot the reel.  
`Fo-3 Fa+6 TT-3`  
Flag: `hypeRisk +1`

**Choice B:** Extra nets.  
`Fo+4 Fa-2 TT+4`  
Flag: `mentorTrust +1`

---

### Situation 8 · Tilak Gets Praise

**What happens:** Tilak finishes a brilliant practice chase. Mahela praises his clarity. You feel the room trusting him in a way it does not trust you yet.

**Core tension:** Learn from the benchmark vs resent the comparison.

**Choice A:** Congratulate him and ask what worked.  
`Fo+3 Fa-1 TT+3`

**Choice B:** Train alone after everyone leaves.  
`Fo+2 Fa+1 TT-2`

---

### Situation 9 · Three Matches On Bench

**What happens:** Three games pass. You warm up, field as sub, carry drinks, smile for cameras. Fan pages are angry on your behalf.

**Core tension:** Stay ready vs feed the public pressure.

**Choice A:** Help fielding drills, stay ready.  
`Fo+2 Fa-1 TT+5`  
Flag: `roleAcceptance +1`

**Choice B:** Like fan posts asking for your debut.  
`Fo+0 Fa+5 TT-4`  
Flag: `hypeRisk +1`

---

### Situation 10 · Mahela Tactical Meeting

**What happens:** Mahela asks directly about your spin matchup. The analyst has numbers. You know it is a weakness.

**Core tension:** Admit the gap vs overclaim readiness.

**Choice A:** Admit weakness and ask for plan.  
`Fo+4 Fa-1 TT+4`  
Flag: `mentorTrust +1`

**Choice B:** Say you are ready for any matchup.  
`Fo+0 Fa+2 TT-3`

---

### Situation 11 · Debut Chance Opens

**What happens:** A player has a niggle. Suddenly there is one slot. Hardik asks what role you can play tonight.

**Core tension:** Any role vs preferred role.

**Choice A:** "Wherever the team needs."  
`Fo+2 Fa+0 TT+5`  
Flag: `roleAcceptance +1`

**Choice B:** Ask for top-order chance.  
`Fo+1 Fa+3 TT-2`

---

### Situation 12 · First IPL Innings

**What happens:** Wankhede lights. Noise. MI need 42 off 28. You walk in. First ball is hittable but not risk-free.

**Core tension:** Build the chase vs announce yourself.

**Choice A:** Build the chase.  
`Fo+6 Fa+2 TT+5`

**Choice B:** Hit the first big shot.  
`Fo+2 Fa+7 TT-2`  
Flag: `hypeRisk +1`

**Note:** Later implementation can add match-result variance, but v1 keeps authored deterministic deltas.

---

### Situation 13 · Post-Match Phone Explosion

**What happens:** Whether you made 18, 34, or 52, your phone is unmanageable. Fan edits, missed calls, friend messages, MI tags.

**Core tension:** Team first vs public wave.

**Choice A:** Message seniors/team first.  
`Fo+1 Fa+1 TT+4`

**Choice B:** Post cinematic celebration reel.  
`Fo+0 Fa+6 TT-3`  
Flag: `hypeRisk +1`

---

### Situation 14 · Next Match Pressure

**What happens:** Now the opponent has plans for you. The public expects a repeat. Hardik says nothing; Rohit only asks, "Same process?"

**Core tension:** Repeat process vs chase headline again.

**Choice A:** Repeat process.  
`Fo+5 Fa+1 TT+4`

**Choice B:** Try to become the headline again.  
`Fo-2 Fa+5 TT-3`

---

## DM Unlock Map

### After Auction

- **Best Friend:** joke + pride + screenshot of fan page.
- **Coach Sir:** grounding line.
- **MI admin:** schedule and media instructions.

### After First Bumrah Net

- If humble: **Bumrah** sends one technical note.
- If attacking: **Best Friend** sends viral clip; **Coach Sir** warns against believing edits.

### After Surya Session

- **Surya** sends playful challenge.
- If player asked method: Surya adds a real cricket note.

### After Bench Phase

- If patient: **Hardik** says stay ready.
- If hype-risk: **Mahela/Hardik** warning scene unlocks.
- **Best Friend** sends fan comments either way.

### Before Debut

- If `homeGrounding >= 2`: Coach Sir sends old academy video.
- If `mentorTrust >= 2`: Rohit or Bumrah sends brief advice.
- If `Fame >= 70`: fan pages create pressure.

### After First Innings

- If Form/Trust choice: Rohit/Hardik message.
- If Fame choice: fan page wave, Surya joke, Coach Sir warning.
- If failure in future versions: Coach Sir + Rohit recovery path.

---

## Ending Resolver

Endings must be mutually exclusive. Use dominant-meter logic, same principle as Creator House.

```
RealDeal        if Form >= 78 AND Form - max(Fame, TeamTrust) >= 8
CaptainsProject if TeamTrust >= 78 AND TeamTrust - max(Form, Fame) >= 8
PaltanWonderkid if Fame >= 78 AND Fame - max(Form, TeamTrust) >= 8
TooMuchTooSoon  if Fame >= 70 AND TeamTrust < 55
else            QuietClimber
```

### The Real Deal

High Form, clear cricket credibility.

> "Fan pages pehle bol rahe the. Ab dressing room bhi maan raha hai. Tum highlight nahi, player ho. Wankhede ne naam yaad rakha, par MI ne process yaad rakha. {name}, tum sirf next big thing nahi. Tum real ho."

### Captain's Project

High Team Trust, not necessarily viral.

> "Sabko tumhara naam trend karna zaroori nahi laga. Hardik ko tumhara role samajh aaya. Mahela ko tumhari clarity dikhi. Rohit ne sirf ek line boli: 'Isko time do.' IPL mein kabhi kabhi yahi sabse bada contract hota hai."

### Paltan Wonderkid

High Fame with enough cricket spark.

> "Every edit had your name. Every MI fan page had your face. Tumne Wankhede ko ek naya obsession de diya. Dressing room abhi bhi tumhe polish karna chahta hai, par public ne decision le liya: prodigy aa gaya."

### Too Much Too Soon

Fame outruns Team Trust.

> "Tum trend hue. Bahut. Shayad zyada. Clips chale, captions aaye, debates bani. Par dressing room ke andar ek sawaal reh gaya: jab next time pressure aayega, kya tum cricket choose karoge ya camera?"

### Quiet Climber

Balanced/default ending.

> "Na tumne season tod diya, na season ne tumhe. Tum bench pe baithe, nets mein seekhe, ek-do pal pakde, kuch chhode. Bahar ke log shayad samjhe nahi. Andar ke log samajh gaye: yeh story khatam nahi hui. Yeh toh pehli entry thi."

---

## Situation Design Principles

Every situation must have:

- A specific cricket setting: time, place, who is present.
- A clear pressure line: what the player risks by choosing poorly.
- One reactor quote before the choice.
- Two choices that are both defensible.
- Meter deltas with real tradeoffs.
- At least one reaction that references the exact choice.
- Optional DM/feed/profile consequence.

**Bad situation:**

> You must choose between fame and practice.

**Good situation:**

> Raat 9:40. Team bus neeche wait kar rahi hai. MI social admin bolta hai reel abhi shoot karni padegi because sponsor approval kal subah hai. Dusri taraf, Bumrah nets mein ek last over daalne ko ready khada hai. Tumhare paas 12 minute hain. Dono nahi ho sakte.

---

## Authoring Format

Use Creator House content grammar with cricket meters:

```md
## S3 · ⚡ MATCHWEEK · NETS · "Bumrah Ka Over"

**body:**

> 3-4 short paragraphs in second-person Hinglish.

**reactor:** Bumrah — *"Tum length guess kar rahe the. Wrist pehle pick karo."*

**question:** Agla over kaise khelte ho?

**Choice A — "Defend, learn, ask what you missed"**

- s: Publicly beaten hona embarrassing hai. Par yahi information hai.
- `Fo+4 Fa-1 TT+4`
- flags: `mentorTrust +1`
- caption: *(koi post nahi — yeh nets ka sach tha)*
- reactions:
  - Bumrah: *"Better. Tumne is baar dekha."*
  - Rohit: *"Good. Ego bahar rakha."*
  - @cricketroom_india: *"Young MI batter spent extra time after Bumrah net. This is how serious teams test prospects."*
- dmUnlock → Coach Sir: *"Aaj beat hua? Achha. Ab video bhej."*
```

Meter delta notation:

- `Fo` = Form
- `Fa` = Fame
- `TT` = Team Trust

---

## LLM Voice Contract

Every LLM generation call must receive:

1. Current situation.
2. Current meters.
3. Last 3 choices.
4. Relevant hidden flags.
5. Character voice card.
6. Relationship state with that character.
7. Output target: DM / group chat / feed comment / reactor line / profile update.
8. Hard rule: no character can contradict their voice card.

### Hard Voice Rules

- Hardik should not sound like Rohit.
- Rohit should not send long motivational speeches.
- Surya should be playful but still cricket-smart.
- Bumrah should be precise and minimal.
- Tilak should not become a jealous villain.
- Coach Sir should never sound like a social media manager.
- Best Friend should never become a batting analyst.
- Real players should never be used for scandal, cruelty, illegal behavior, romantic fantasy, or invented private controversy.

---

## Tone and Language

**Register:** Natural Hinglish.

- More Hindi in emotional/personal moments.
- More English in professional cricket settings.
- Technical cricket terms are allowed: matchup, role, tempo, death overs, powerplay, release shot, length, slower one, swing, match-up, XI, nets.

**POV:** Second person throughout. Use "tum."

**Writing test:** Read the situation out loud. Does it sound like something that could happen at Wankhede, team hotel, nets, bus, or after a match? If it sounds generic, add one specific cricket object or pressure: gloves drying near kit bag, analyst laptop, MI social admin waiting, Bumrah marking run-up, Surya laughing near side-net, Coach Sir's old academy video.

---

## What Is Not In v1

- Full ball-by-ball match engine.
- Romance arc.
- Per-player relationship meters.
- All IPL teams.
- User-chosen franchise.
- National team selection.
- U19 and domestic seasons.
- Scandal/political dressing-room drama with real players.

Those can come later. v1 must prove the core fantasy:

> **A young prodigy enters MI. Every cricket choice changes Form, Fame, and Team Trust. The room reacts. The internet reacts. Your profile changes. Your season identity emerges.**

---

## Future Seasons

### Season 2 — U19 Flashback

Shows how the player became visible:

- Academy match.
- Viral U19 innings.
- State trial.
- Childhood coach relationship.
- First rival.
- Family/friend pressure.
- First fan page.

### Season 3 — Domestic Grind

Tests whether the player is a complete cricketer:

- Red-ball patience.
- Senior domestic dressing room.
- Bad pitch runs.
- State captain trust.
- Selector watching.
- Less fame, more cricket.

### Season 4 — India A / Selection Radar

Starts the national-team path:

- India A tour.
- Fitness test.
- Selector ambiguity.
- Press debate.
- Role conflict.
- Whether IPL fame translates to India trust.
