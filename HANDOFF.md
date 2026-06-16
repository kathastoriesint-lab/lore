# Lore — Handoff / Onboarding

This is the single doc to read before working on Lore. It covers what the product is,
how it's wired, how to run + deploy, the gotchas, and the open work. Pair this with the
**secrets** (see "What you need from Nabh") — the repo alone builds but won't run without them.

---

## 1. Product

Lore is an interactive-story app. India-first, Hinglish, audience ~18-25.
Pitch: **"Stop reading stories — start living in them."** You pick a WORLD, become a
character, and your choices move meters, the characters DM you back (AI, in-character
Hinglish, multi-bubble like WhatsApp), a feed reacts to you, and you reach one of several
endings.

Two worlds are built:

- **Indian Dressing Room (cricket).** You're a 16-year-old Mumbai Indians prodigy.
  30 situations across ~19 in-game days, a 7-"Match Week" gated season, debut/semi/final
  match results gated on Form, **5 endings**. You play AS yourself (`char='player'`).
- **Creator House (reality villa).** You're the NEW 6th creator. 28 situations / 10 days,
  **eviction nights** (Day 3 & Day 7), TRUST-driven survival (you can be evicted), character
  **dossiers** that unlock by bond, **4 endings**. Cast: Ria, Kabir, Ananya, Dev, Zoya.
  Crush/Ally swaps by player gender (Kabir = crush for F / ally for M; Ananya = crush for
  M / confidante for F). Ria/Dev/Zoya are fixed.

---

## 2. Stack

- **Next.js 16** (App Router), client-heavy SPA, vanilla CSS with a small token set. App
  is at the **repo root**.
- **Supabase** — Postgres (`game_state`, `dm_messages`), anonymous device auth, and the
  edge function **`lore-chat`** (AI chat + reply suggestions + trust-scoring). Models:
  `gpt-5.4` / `gpt-5.4-mini`. Project ref: `pxbmfrwdyozjapezlmyp`.
- **One Next route** `/api/narrate` (ElevenLabs TTS) — the only server route.
- **Vercel** hosts production; a GitHub Actions workflow auto-deploys on push to `main`.

Meter slot mapping (the same three fields mean different things per world):
- Cricket: `fame` = Form 🏏, `heat` = Fame ⭐, `image` = Team Trust 🤝.
- Creator House: `fame` = Fame, `heat` = Heat, `image` = Image/Trust.

---

## 3. Repo & deploy — READ THIS

- Repo: `github.com/kathastoriesint-lab/lore`. Branch **`main` = production**, app at root.
- **Always work in a clean clone** of this repo. Do NOT use any `Katha_MVP/lore-next`
  folder on the original machine — that path got tangled (its `.git` was deleted and folded
  into a parent repo with the wrong structure, app under a `lore-next/` subfolder). Ignore it.
- **CI auto-deploy is currently broken**: the `VERCEL_TOKEN` GitHub secret is expired, so
  pushes to `main` fail the deploy step. Until it's regenerated, **deploy via CLI** (below).

### Run locally
```bash
npm install
# create .env.local from .env.local.example and fill in real values (see section 5)
npm run dev          # http://localhost:3000
npm run build        # production build (must pass before deploying)
npm test             # vitest
```

### Deploy the web app (until CI token is fixed)
```bash
# from the repo root, with .vercel linked to project lore-next:
#   projectId prj_tcypybH9EJmoM2A2ZnPPWTUCho4k, orgId team_61A4t0AXIKLN4gN8up9jPutW
npx vercel --prod --yes
# production alias: https://lore-next-ashy.vercel.app
```

### Deploy the edge function (after editing supabase/functions/lore-chat)
```bash
SUPABASE_ACCESS_TOKEN=<ask Nabh> \
  npx supabase functions deploy lore-chat --no-verify-jwt --project-ref pxbmfrwdyozjapezlmyp
```

### To restore CI auto-deploy
Regenerate a Vercel token (Vercel → Account → Tokens) and update the `VERCEL_TOKEN` repo
secret. Then push-to-`main` deploys again. The workflow is `.github/workflows/*.yml`.

---

## 4. Key files

| Path | What |
|---|---|
| `lib/cricket-data.ts` | 30 cricket situations, characters, 5-ending resolver |
| `lib/season.ts` | Cricket 7 Match Weeks + gates + interlude lock loop |
| `lib/data.ts` | 28 Creator House situations + `DM_HOOKS` (DM openers) |
| `lib/dossier.ts` | CH character bible (persona/wants always; truth/fears @ bond 45; secret @ 68) |
| `lib/creator-house.ts` | CH eviction system (TRUST-driven; player can be evicted) |
| `lib/game.ts` | Pure rules: `applyDeltas`, `resolveEnding`, `evaluateGate`, queue builders |
| `supabase/functions/lore-chat/index.ts` | ALL AI character prompts + suggestion + trust-score modes |
| `components/GoalCard.tsx` | Cricket "what am I working toward" surface |
| `components/CHStatusCard.tsx` | Creator House eviction-risk surface |
| `components/screens/*` | Live, Feed, DMThread, CharProfile, Eviction, WorldIntro, etc. |
| `docs/*-world-bible-*.md` | The canonical world bibles (source of truth for content) |
| `docs/lore-chat-prompts-review.xlsx` | Review export of all prompts (regen: `node gen-prompts-xlsx.mjs`) |

---

## 5. What you need from Nabh (NOT in the repo — secrets)

Only `.env.local.example` (a template, no values) is committed. To run/deploy you need:

- `.env.local` real values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, ElevenLabs key (for narration).
- `SUPABASE_ACCESS_TOKEN` (to deploy the edge function).
- Vercel access (the `.vercel` link is git-ignored; CLI must be logged in to the
  `nabhgargs-projects` / `lore-next` project).
- The edge function's `OPENAI_API_KEY` is set as a Supabase secret, not in the repo.

Never commit secrets.

---

## 6. Content / writing norms

- **Hinglish** for narrative + dialogue; **English** for buttons/CTAs (rule "P1-7").
- AI prompts demand **natural spoken Hinglish** — no textbook/translated-from-English Hindi.
- AI replies are **multi-bubble** (model splits on `|||`, client delivers one at a time).
- Every reply **ends on a question** to keep the conversation going — UNLESS the player was
  rude/abusive, in which case the character pushes back instead of rewarding it.
- Player gender drives gendered Hindi (aaya/aayi, kar raha/rahi) in both chat and suggestions.
- Creator House: the **dossier is the canon/bible**; DMs reveal it gradually, gated by trust
  (low = persona only; high = truth surfaces; the secret is never just confessed).

---

## 7. Open work (prioritized)

### Cricket (from a CEO-level review)
- **P0 — choice monotony.** ~26 beats collapse to the same "humble/team-first vs
  flashy/spotlight" axis, with one correct answer. Diversify the choice axes (some Form-vs-
  Trust, some lateral) and make the bold option sometimes-correct.
- **P0 — outcome not framed before Live.** The intro teaches the 3 meters but never names
  what you're playing toward (the India call-up north-star, the 5 endings, the stakes of not
  advancing). Creator House already got this fix (a 4-slide intro carousel) — mirror it for cricket.
- **P1 — ending invisible mid-run.** The 5 endings only show on the final screen; surface
  the trending arc from ~Week 4.
- **P1 — DMs/Feed not narratively connected.** DMs gate progression but don't reference the
  beat you just played or the week goal; fan-account feed commentary repeats.
- **P2** — 24h real-time interlude lock (`DEFAULT_LOCK_MS`): verify it's short for testing.
  Dead content `CR-S28` (authored but filtered out everywhere): restore or delete.

### Creator House
- "Solve Creator House" was the active task (mid-audit): make the loop feel connected to an
  outcome the way cricket does (goal legibility + outcome framing).
- **Piece 3** = inline stories + romance (not started).

### Housekeeping
- `docs/lore-chat-prompts-review.xlsx` notes are stale vs current prompts — regenerate via
  `node gen-prompts-xlsx.mjs`.
- Regenerate the `VERCEL_TOKEN` GitHub secret to restore CI auto-deploy.

---

## 8. Working norms

After making changes: typecheck (`npx tsc --noEmit`), `npm run build`, deploy the edge
function if you touched it, deploy the web app via CLI, then confirm on the production alias.
Commit messages: clear and scoped. Prod is `main` and (once the token is fixed) auto-deploys,
so keep `main` green.
