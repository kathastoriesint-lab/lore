# Google Play submission — answer sheet for Lore

Everything you need to fill in the Play Console, drafted from the codebase.
Copy-paste directly. Placeholders in **CAPS** need your real value.

> **The launch path (in order):**
> 1. Finish setting up your app (this doc)
> 2. Internal testing (optional device check)
> 3. **Closed testing — 12+ testers, 14 days minimum** (Google requirement before production)
> 4. Apply for production
>
> Budget ~2+ weeks minimum because of the closed-test gate. Line up your 12 testers now.

---

## App identity (already set / permanent)

| Field | Value |
|---|---|
| App name | Lore |
| Package name | `com.kathastories.lore` |
| Privacy policy URL | `https://lore-next-wine.vercel.app/privacy` |

---

## "Finish setting up your app" tasks

### App access
- The app has login-gated content (phone OTP sign-in). A **reviewer demo login is built in**
  (skips MSG91 — no real SMS needed).
- Choose **"All or some functionality is restricted"** and paste these reviewer instructions:

  ```
  This app normally signs in with a phone OTP. For review, use the built-in demo login:
  1. On the login screen, enter phone number: 9000000000
  2. Tap Continue.
  3. Enter the code: 0000
  You'll be taken into the app with full access to both story worlds. (Alternatively, tap
  "Or login using another method" → "Continue as guest" for the same full access.)
  ```
  No test account / credentials needed — the demo login and guest mode both give full access.

### Ads
- **No**, the app does not contain ads.

### Content rating (questionnaire)
Answer based on **suggestive/mild** content:
- Category: **Interactive / Entertainment app** (not a game of chance).
- Violence: **None**.
- Sexuality: **Yes — mild/suggestive** (romance, flirtation; no explicit sexual content).
- Profanity: **Mild**, if any.
- Controlled substances: **None**.
- User-generated content / interaction: **Yes** — users exchange messages with AI characters;
  disclose that the app has interactive online features.
- Expected result: **Teen / PEGI 12–16 range.**

### Target audience & content
- Target age group: **18 and over** (romance/"spicy" themes; keeps you out of the stricter
  Families policy).
- Is the app appealing to children? **No.**

### Data safety (declare all of this — pulled from the code)
**Does your app collect or share user data? → Yes.**

| Data type | Collected | Shared | Purpose | Optional? |
|---|---|---|---|---|
| Phone number | Yes | No | Account management, authentication | Required |
| Email address | Yes | No | Account management | Optional |
| User messages (in-story chat) | Yes | **Yes → OpenAI** | App functionality (generate replies) | Required for chat |
| App activity (screens, events, in-app actions) | Yes | No | Analytics, app functionality | — |
| Device or other IDs (random device ID, session ID) | Yes | No | Analytics, app functionality | — |
| App interactions / gameplay progress | Yes | No | App functionality (save progress) | — |

- **Is data encrypted in transit?** Yes.
- **Can users request deletion?** Yes — via the email in the privacy policy.
- **Data collection processors:** Supabase (backend), MSG91 (OTP), OpenAI (chat), Vercel (hosting).

### Government apps / Financial features / Health
- **No** to all.

---

## Store listing

**App name** (30 max)
```
Lore
```

**Short description** (80 max)
```
Live inside interactive stories. Your choices, your drama, your ending.
```

**Full description** (4000 max)
```
Stop reading stories — start living in them.

Lore drops you inside a world as the main character. Every choice you make moves the
story, shifts your relationships, and changes how it ends. Characters DM you back in real,
in-the-moment conversations. A feed reacts to what you do. The drama is yours to steer.

TWO WORLDS TO LIVE IN

🏏 Indian Dressing Room
You're a 16-year-old prodigy who just signed for the biggest team in the league. Earn your
debut, survive the pressure, handle the seniors, and chase your place in the side across a
full season. Five different endings depend on the calls you make.

🏠 Creator House
You're the newest face in a house full of creators, cameras, and rivalries. Build your
following, pick your allies, survive eviction nights, and see where a spark from your past
might lead. Four endings, and no two players play it the same.

WHY LORE

• Real choices with real consequences — meters, relationships, and endings all react to you
• Characters that message you like real people, in the moment
• A living feed that responds to your every move
• Short, bingeable story beats made for your phone
• India-first stories, in the voice you actually speak

Your story is waiting. Step in.
```

**App category:** Entertainment
**Tags:** interactive fiction, choices, story game, drama, romance

**Contact details (public):**
- Email: **hello@kathastories.com** *(TODO: confirm exact address)*
- Website: **https://kathastories.com** *(TODO: confirm)*
- Phone: optional

---

## Graphics assets

| Asset | Requirement | What to use |
|---|---|---|
| App icon | 512×512 PNG, 32-bit | Export from `assets/` icon source |
| Feature graphic | 1024×500 PNG/JPG (**required**) | ✅ **DONE** — `store-assets/feature-graphic-1024x500.png` (also in ~/Downloads) |
| Phone screenshots | 2–8 images, 16:9 or 9:16, min 320px | `deployed-screenshots/` — they're 860×1864, perfect |

**Recommended screenshot picks** (from `deployed-screenshots/`):
1. `05-cricket-world-intro.png` — world select / hook
2. `06-cricket-feed.png` — the living feed
3. `07-story-situation.png` — a choice moment
4. `08-dm-inbox.png` — characters DMing you
5. `11-creator-house-intro.png` — second world
6. `12-creator-house-feed.png`
7. `13-creator-house-story.png`
8. `10-global-profile.png` — progression

> ✅ **Feature graphic done:** `store-assets/feature-graphic-1024x500.png` — LORE wordmark over
> both worlds (cricket celebration + villa). Regenerate anytime from `public/feature-graphic.html`.

---

## App bundle (AAB)

Production requires a signed **.aab** (Android App Bundle), not an APK.
- Play App Signing will be on by default — let Google manage the signing key.
- ⚠️ **WebView flag:** your `capacitor.config.ts` loads the app from `server.url`
  (the Vercel site) rather than bundling the web build. Google can reject apps that are just a
  web wrapper. Your native plugins (local notifications, phone auth bridge) help the case, but
  be ready to justify it if review pushes back.
