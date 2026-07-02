# Indian Dressing Room Image Consistency Lock (v1)

Use this block at the top of every generation prompt (before the scenario-specific line).

## Global Lock Block

Photorealistic vertical 4:5 social image from the same visual universe as prior Indian Dressing Room posts.

Continuity rules (strict):
- Same recurring protagonist identity in every post: 16-year-old Indian right-handed batting prodigy, lean-athletic build, medium wheatish skin tone, short black wavy hair, clean-shaven, focused expression.
- Keep protagonist mostly in side-angle, three-quarter, or back-angle frames (avoid front-facing close-up portraits).
- Keep Mumbai blue kit family consistent across all images (training bibs, practice jerseys, match blues from same palette family).
- Keep senior recurring characters visually stable across scenes (same approximate age band, hairstyle, body type, and silhouette each time).
- Keep camera language consistent: documentary sports photography, natural stadium/net lighting, realistic grain, handheld phone-camera feel.
- Keep location continuity believable: Wankhede nets, MI dressing-room style interiors, team hotel corridors, tunnel, dugout.
- No readable text in image, no logos requiring exact trademark rendering, no fake UI overlays, no watermark.
- Keep lower 20-25% relatively calm/darker for app caption overlay.

Negative constraints:
- no cartoon style, no illustration, no over-airbrushed skin, no dramatic fantasy lighting, no extra fingers, no crowd faces dominating frame, no direct celebrity face recreation.

## Account Tone Modifiers

Append one of these after the global lock block:

- `@mipaltan` / `@mumbaiindians`: clean official framing, composed, premium sports editorial.
- `@paltanpulse` / fan pages: candid sideline angle, slightly raw capture, emotional moment-first.
- `@cricketroom_india`: tactical frame, coach/player interaction, process-heavy moment.
- Player `@nabh`: intimate first-person or nearby teammate POV, emotional but restrained.

## Practical Generation Note

Prompt-only consistency improves quality, but exact face continuity across 80+ images is best achieved by:
1. creating locked reference images for protagonist + key seniors,
2. passing those references on each generation call,
3. keeping one fixed seed per character family.
