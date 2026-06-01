# Lore — Content Creation Pipeline

How to create a new world and get it live in the app.

## Overview

```
World Bible (worlds/*.md)
        ↓
generate-situations.mjs  →  day2-4-situations.json
generate-avatars.mjs     →  lore-next/public/avatars/*.png
        ↓
lib/data.ts (SITUATIONS array + CHARS)
        ↓
git push → Vercel auto-deploys
```

## Step-by-step

### 1. Write the world bible

Copy `worlds/creator-house.md` as your template. Key sections to fill:
- Premise + dramatic spine
- World rules (5-7 falsifiable rules characters must follow)
- Meters (what 3 stats track for this world — e.g. Fame/Trust/Heat)
- Characters (8 total, 3 playable, with secrets + agendas + voice)
- Locations + key relationships

Save as `worlds/{world-id}.md`.

### 2. Generate situations

Edit `generate-situations.mjs`:
- Set `worldBible = readFileSync('worlds/{your-world}.md', 'utf8')`
- Update the `EXISTING_SITUATIONS` summary for your world
- Set `model: 'gpt-5.4'` (already set)

Run:
```bash
node generate-situations.mjs
```

Output saved to `day2-4-situations.json`. **Check the output before using it** — verify you got the expected number of situations and all char IDs match the CharId type.

**Required fields on each situation:**
- `tag`: `⚡ DAY N · TIME` format
- `day`: integer 1-5 (required for day gating)
- `chars`: array of CharId if world-specific, omit for shared (IMPORTANT — missing chars bleeds into other worlds)
- `title`, `body[]`, `react`, `q`, `choices[2]` — see existing situations for shape
- `feedReaction`: (optional) post that appears in feed after this choice

### 3. Generate avatars

Edit `generate-avatars.mjs`:
- Update `CHARS` array with your 8 characters + prompts
- Cost: ~$0.04/image × 8 = ~$0.32

Run:
```bash
node generate-avatars.mjs
```

Images saved to `lore-next/public/avatars/{char-id}.png`.

### 4. Add to data.ts

In `lore-next/lib/data.ts`:
- Add your characters to `CHARS` (type: `Record<CharId, Character>`)
- Add `CHAR_DESC` entries for the world intro character parade
- Append situations to `SITUATIONS` array — use Approach B format with `feedReaction`

**Checklist before pushing:**
- [ ] Every situation has `day: N`
- [ ] World-specific situations have `chars: ['your-char-id']`
- [ ] All `react.char` and `reactions[].char` values are valid CharId values
- [ ] `feedReaction` added to at least the first 2 shared situations

### 5. Update WorldIntroScreen (if new world)

`WorldIntroScreen.tsx` currently has Creator House content hardcoded.
For a new world, you'd need to add world-switching logic or create a separate intro screen.

### 6. Build check

```bash
cd lore-next && npm run build
```

TypeScript will catch bad char IDs if you use typed interfaces. Fix any errors.

### 7. Deploy

```bash
git add -A && git commit -m "feat: add {world-name} world"
git push
npx vercel --prod
```

## Model reference

| Task | Model | Approx cost |
|---|---|---|
| Generate situations (9) | `gpt-5.4` | ~$0.15 |
| Generate avatars (8) | `gpt-image-1` | ~$0.32 |
| AI DMs (per message) | `gpt-5.4-mini` | <$0.001 |
| Trust scoring (per exchange) | `gpt-5.4-mini` | <$0.001 |

## Troubleshooting

**Situations showing in wrong world:** Missing `chars` field. Add `chars: ['your-char-id']` to all world-specific situations.

**App crashes on Live screen:** Typo in `react.char` or `reactions[].char`. Must be a valid `CharId` value from `lib/types.ts`.

**Day gate not working:** Missing `day: N` on a situation, or `day_unlock_time` column missing from Supabase (run: `ALTER TABLE game_state ADD COLUMN IF NOT EXISTS day_unlock_time jsonb DEFAULT '{}'`).

**Avatar generation fails:** Check OpenAI API key in `.env`. `gpt-image-1` requires the latest API access.
