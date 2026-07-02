# Asset library

Single index of every generated image asset in this repo, and the prompts used to make them.
All of it is already committed and pushed to GitHub — this folder is just a map, not a copy of
the binaries (duplicating 185 image files here would double the repo size for no reason).

## Where the images live

| Folder | What's in it | Count |
|---|---|---|
| [`public/avatars/`](../../public/avatars) | Character avatar portraits (Creator House + Cricket World casts) | 25 |
| [`public/generated/creator-house-posts/`](../../public/generated/creator-house-posts) | Feed post images for the Creator House world | 12 |
| [`public/generated/cricket-posts/`](../../public/generated/cricket-posts) | Feed post images for the Cricket World (Mumbai Indians dressing room) | 53 |
| [`docs/generated/`](../generated) | Reference/test renders (e.g. `CR-S1-A-1` prompt A/B/C tests, no-player vs player variants) | 5 |
| [`public/day1-preview/assets/`](../../public/day1-preview/assets) | Scene/location art + avatars used in the Day 1 interactive preview | 7 |
| [`public/goals-directions/assets/`](../../public/goals-directions/assets) | Same scene/avatar art, reused for the goals-system design preview | 6 |
| [`public/login-hero-1.jpg`, `-2`, `-3`](../../public) | Login screen hero images | 3 |
| [`assets/`](../../assets) | App icon + splash screen source images (Capacitor/mobile build) | 5 |
| [`deployed-screenshots/`](../../deployed-screenshots) | Dated screenshots of the deployed app, one per screen | 15 |

Not asset content, but also image files: `android/app/**` and `ios/App/**` contain the
auto-generated native app-icon/splash resource sets (every resolution Capacitor needs) — these
are build output, not source creative, so they're not indexed here.

## Where the prompts live

- [`prompts/cricket-post-image-prompts-v1.md`](prompts/cricket-post-image-prompts-v1.md) — the
  full prompt sheet for every Cricket World feed post image (84 surfaces), one row per post:
  situation ID, caption, and the exact image-generation prompt used.
- [`prompts/cricket-post-image-consistency-lock-v1.md`](prompts/cricket-post-image-consistency-lock-v1.md) —
  the "consistency lock" rules layered on top of the sheet above, so the protagonist/art style
  stays consistent across all 84 images.
- Avatar portraits (`public/avatars/`) and Creator House post images
  (`public/generated/creator-house-posts/`) were generated ad hoc in chat sessions rather than
  from a saved prompt sheet — no prompt doc exists for those yet. If you want one, the next
  person to touch that world should write a `creator-house-post-image-prompts-v1.md` in the same
  format as the cricket sheet above before generating any new images, so future assets stay
  reproducible.

## Adding new assets

See [`CONTENT-PIPELINE.md`](../../CONTENT-PIPELINE.md) at the repo root for the end-to-end steps
(world bible → situations → avatars → wiring into `lib/data.ts` → deploy). When you generate a
new batch of post images, save the prompt sheet next to the two above in `prompts/` so this
folder stays the source of truth.
