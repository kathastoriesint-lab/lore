# Creator House — Image Generation Prompts (v4)

Complete, consistency-locked prompt package for every image slot in Creator House v4.
Generator target: **gpt-image-2** (OpenAI). Because gpt-image-2 has no seed/reference
chaining, **consistency comes from repeating the locked character description in every
prompt** that features that person. Copy the character's **Consistency Lock** block
verbatim into any prompt that includes them.

Image files live in `public/generated/creator-house-posts/` (scenes, seeds, screenshots)
and `public/avatars/` (square headshots).

---

## 0. GLOBAL STYLE GUIDE (prepend to every prompt)

> **Style:** Photorealistic editorial influencer photography, shot for Instagram. Modern
> Indian creator-reality-show aesthetic (think a glossy Goa content house). Warm cinematic
> color grade, soft filmic contrast, shallow depth of field, natural skin texture (visible
> pores, not plastic). Mixed lighting: warm golden-hour sun + ring-light fill + practical
> string lights. Rich but not oversaturated. 35mm look, subtle grain. No on-image captions,
> watermarks, logos, or UI unless explicitly requested. No text unless requested. Hands and
> fingers anatomically correct. Authentic South-Asian / Indian faces.

**Aspect ratios**
- Square headshots (`/avatars/*`): **1:1**
- Seed feed posts + player posts: **4:5** (portrait IG)
- Story scene images (`scene-*`, `seed-villa`): **4:5** portrait (renders inside a phone card)
- Reveal screenshots (`ch-*-leak`): **9:19.5** phone screenshot, UI + legible text

**Two hard consistency rules (gender + POV):**
1. **Never show the player's face** in any scene image. The player is the POV character and
   their avatar is user-chosen (and can be male or female). Frame scenes as
   establishing shots, over-the-shoulder, or environment-first. If a second person is in
   frame with the player, show only the *other* character clearly.
2. **The "crush" and "ally" swap by player gender** (male player → crush = Ananya, ally =
   Kabir; female player → crush = Kabir, ally = Ananya). Any scene built around the crush/ally
   role (e.g. the terrace-coffee moment) must be **face-agnostic** — two coffee mugs on a
   terrace ledge, hands only, backs turned, or ambient — so the same image is true for both
   genders. Where a clear crush face is unavoidable, generate **two variants** (`-ananya` /
   `-kabir` suffix) and wire per gender. These are flagged below.

---

## 1. CHARACTER VISUAL BIBLES

Each character's look is derived from their dossier personality so the image *reads* as the
character. The **Consistency Lock** is the block to paste into every prompt with that person.

### RIA — the queen bee (fake old-money luxury)
*Dossier: "clean, classy, untouchable"; whole rich-girl life is on credit; terrified the mask slips.*
- **Consistency Lock:** *Ria — Indian woman, 27, tall and willowy, sharp symmetrical features,
  high cheekbones, cool confident resting expression with a slight chin-up tilt. Sleek jet-black
  centre-parted hair, pin-straight, past the shoulders. Flawless matte "quiet-luxury" glam:
  nude-brown lip, defined brow, subtle contour. Palette: cream, camel, ivory, gold. Delicate
  gold jewellery (thin hoops, layered chains), a single statement watch. Immaculate, expensive,
  a touch too perfect.*
- Vibe cue: appraising, composed, always the most "done" person in the room.

### ZOYA — the sweet assassin (beauty / GRWM)
*Dossier: "camera on: hii babies 🥰; camera off: chaaku"; leaks rivals' bad photos.*
- **Consistency Lock:** *Zoya — Indian woman, 25, soft round face, large expressive doe eyes,
  dewy "glass-skin" beauty-influencer makeup, glossy pink lip, fluttery lashes. Wavy shoulder-
  length dark-brown hair with warm caramel babylights. Palette: pastel pink, lilac, peach,
  pearl. Soft feminine styling — satin, ribbons, a dainty pendant. A sugary practiced smile
  that does not quite reach the eyes.*
- Vibe cue: warm and cutesy on the surface, calculating underneath.

### ANANYA — the genuine one (viral dancer, 23)
*Dossier: "ghar ki sabse seedhi"; bubbly viral dancer; real smile, real fear; easiest target.*
- **Consistency Lock:** *Ananya — Indian woman, 23, petite, fresh girl-next-door beauty, warm
  open smile, expressive bright eyes, minimal "no-makeup" makeup with a natural flush and glossy
  lip. Natural wavy dark-brown hair, often half-up or loosely tied. Palette: soft white, butter
  yellow, sky blue, denim — casual and cute, dancer's easy posture. Approachable and a little
  shy.*
- Vibe cue: genuine warmth, slightly guarded from being hurt, luminous on camera.

### KABIR — the friendly puppetmaster (drama architect)
*Dossier: "sabka yaar kisi ka nahi"; sets others' fights; keeps everyone's screenshots.*
- **Consistency Lock:** *Kabir — Indian man, 26, lean athletic build, easy disarming grin,
  tousled dark hair, light stubble, one eyebrow habitually raised. Streetwear: graphic tee or
  open shirt over a tee, silver chain, casual cap or beanie sometimes. Palette: charcoal, olive,
  washed black, a pop of street-brand colour. Almost always holding a phone, mid-film. Relaxed,
  magnetic, watching everything.*
- Vibe cue: the fun guy everyone trusts — filming the chaos he started.

### DEV — the fitness sellout
*Dossier: "pura sellout, loyalty is a deal"; brand-on-brand; secret failed-supplement debt.*
- **Consistency Lock:** *Dev — Indian man, 28, tall and heavily muscular, low fade haircut,
  trimmed beard, strong jaw. Athleisure and fitted tanks/compression tees, visible brand logos,
  smartwatch, veined forearms. Palette: black, steel grey, neon-accent activewear. Posture
  slightly flexed, intense but hollow gaze.*
- Vibe cue: disciplined gym-bro energy that's really all transactional.

### PLAYER — the small-town underdog (POV, face never shown)
*The viral outsider the villa underestimates. Male default "Arjun", but can be female.*
- **Consistency Lock (POV only):** *The player is the point-of-view character — do NOT show
  their face. Represent them via hands, a phone held toward camera, an over-the-shoulder back-of-
  head (gender-neutral: simple dark hair, plain modern casual clothing, no strong gendered
  styling), or their empty spot in frame. Understated, less polished than the villa crowd —
  simple solid-colour basics, no designer labels.*

### housewatch_india — the gossip account (not a person)
- **Consistency Lock:** *A brand/logo graphic, never a face. Dark charcoal card, a stylised
  white "eye" mark or 👀 motif, bold condensed sans-serif "HOUSEWATCH" wordmark, faint tabloid-
  halftone texture. Feels like an anonymous reality-TV gossip page.*

---

## 2. SETTING BIBLE — the Goa Creator Villa

Paste into establishing/scene prompts:

> **The Villa:** A modern luxury Goa content house. Whitewashed walls + terracotta accents,
> palm trees, an infinity pool glowing turquoise, wraparound terrace with a distant ocean/city-
> light view. Interiors: pastel modern furniture, rattan + boucle, neon house-logo sign, ring
> lights and tripods in every corner, warm string lights, tropical plants. Golden-hour sun by
> day; deep blue night with warm practical lights. Aspirational, camera-ready, a little
> artificial — every corner built to be filmed.

---

## 3. PER-IMAGE PROMPTS

### A. Character avatars — square headshots (1:1) → `public/avatars/{id}.png`

**ria.png**
> [GLOBAL STYLE] [RIA Consistency Lock] Tight square profile-photo headshot of Ria, head and
> shoulders, looking straight into the lens with a cool confident half-smile, chin slightly up.
> Soft luxury indoor lighting, creamy bokeh of the villa behind her, gold jewellery catching the
> light. Instagram profile-picture framing, centred, sharp on the eyes. 1:1.

**zoya.png**
> [GLOBAL STYLE] [ZOYA Consistency Lock] Tight square headshot of Zoya, head and shoulders,
> giving a sweet cutesy smile with a slight head-tilt, dewy glass skin, glossy pink lip. Soft
> pastel-pink ring-light glow, pearly bokeh. Instagram profile-picture framing, centred, sharp
> on the eyes. 1:1.

**ananya.png**
> [GLOBAL STYLE] [ANANYA Consistency Lock] Tight square headshot of Ananya, head and shoulders,
> warm genuine laughing smile, natural glow, hair half-up with a few loose strands. Bright soft
> daylight, airy white-and-yellow bokeh. Instagram profile-picture framing, centred, sharp on
> the eyes. 1:1.

**kabir.png**
> [GLOBAL STYLE] [KABIR Consistency Lock] Tight square headshot of Kabir, head and shoulders,
> disarming grin with one eyebrow raised, tousled hair, light stubble, silver chain. Moody warm
> indoor light, charcoal bokeh with a street-brand colour pop. Instagram profile-picture
> framing, centred, sharp on the eyes. 1:1.

**dev.png**
> [GLOBAL STYLE] [DEV Consistency Lock] Tight square headshot of Dev, head and shoulders, strong
> jaw, intense confident look, fitted black tank showing built shoulders, smartwatch visible.
> Cool gym-lit rim light, steel-grey bokeh. Instagram profile-picture framing, centred, sharp on
> the eyes. 1:1.

---

### B. Seed feed posts — first-day Instagram posts (4:5) → `seed-{id}.png`
*These are the characters' own IG posts on Day 1. Each should read like a real influencer post
in that person's exact niche.*

**seed-ria.png** *(currently the golden-hour post shown in the feed)*
> [GLOBAL STYLE] [RIA Consistency Lock] Ria photographed from behind/three-quarter on a
> golden-hour Goa terrace at sunset, palm silhouettes, flowing cream outfit, looking out over the
> view — an aspirational "effortless luxury" lifestyle post. Warm backlight, lens flare, quiet-
> luxury mood. 4:5.

**seed-zoya.png**
> [GLOBAL STYLE] [ZOYA Consistency Lock] Zoya mid "GRWM" beauty selfie at a vanity ringed with
> warm bulbs, holding a makeup brush to her cheek, pastel-pink setup, glossy glam, cutesy peace
> sign. Bright dewy beauty-influencer lighting. 4:5.

**seed-ananya.png**
> [GLOBAL STYLE] [ANANYA Consistency Lock] Ananya caught mid-dance-pose in a bright airy villa
> corner, natural motion, joyful laugh, casual white-and-yellow fit, a ring light just off frame
> — a viral-dancer reel thumbnail. Fresh daylight, energetic. 4:5.

**seed-kabir.png**
> [GLOBAL STYLE] [KABIR Consistency Lock] Kabir doing a to-camera "vlog" selfie in the villa,
> arm extended holding the phone (mirror or POV), smirk, pointing at something off-frame like
> he's narrating drama, streetwear + chain. Warm casual indoor light. 4:5.

**seed-dev.png**
> [GLOBAL STYLE] [DEV Consistency Lock] Dev in a shirtless/tank gym-mirror post flexing, poolside
> outdoor gym corner of the villa, water bottle with a visible brand, harsh flattering sunlight,
> "grind never stops" energy. 4:5.

---

### C. Story scene images (4:5 portrait) → `public/generated/creator-house-posts/`

**seed-villa.png** — *villa establishing shot (D1-1 arrival; reused D4-1, D5-2)*
> [GLOBAL STYLE] [SETTING BIBLE] Wide establishing shot of the Goa creator villa's grand
> entrance at golden hour: iron gate swinging open onto a whitewashed modern mansion, infinity
> pool glinting, palms, neon house-logo sign glowing, ring lights and tripods visible on the
> terrace. Aspirational and camera-ready, no people (or distant blurred figures only). Warm
> cinematic light. 4:5.

**scene-challenge.png** — *D1-2 the first reel challenge in the lounge*
> [GLOBAL STYLE] [SETTING BIBLE] Interior villa lounge set up for a reel challenge: a ring
> light and phone-on-tripod front and centre facing an open floor, pastel modern furniture pushed
> back, house-logo neon behind, other creators blurred watching from the sides (no clear faces).
> Energy of "everyone's about to film." Warm indoor + ring-light glow. POV/observer framing — do
> not show the player. 4:5.

**scene-terrace-night.png** — *terrace 1 AM (D1-3 / D4-2 / D5-1). ⚠ crush scene → keep face-agnostic*
> [GLOBAL STYLE] [SETTING BIBLE] Quiet villa rooftop terrace at 1 AM: two steaming coffee mugs
> resting on a concrete ledge, warm string lights overhead, deep blue night, distant city/ocean
> lights bokeh, two empty lounge chairs. Intimate, calm, "away from the cameras" mood. **No
> faces, no clear people** — just the mugs, the lights, the view (works for any player gender).
> Cinematic, tender, shallow depth of field. 4:5.

---

### D. Player reel posts (4:5) → the D1-2 outcome images

**ch-reel-parody.png** — *player's cheeky parody of Ria's "aesthetic morning routine" reel*
> [GLOBAL STYLE] [SETTING BIBLE] A funny parody "morning routine" reel thumbnail shot in the
> villa — exaggeratedly staged aesthetic-influencer clichés played for comedy (over-the-top
> "candid" sipping, dramatic curtain-open, ironic slow-mo vibe), a phone-on-tripod and ring
> light in frame. Comedic, self-aware, screenshot-of-a-viral-reel energy. **Do not show the
> player's face** — POV/hands/over-shoulder, or a body-only comedic pose with face out of frame.
> 4:5.

**ch-reel-clean.png** — *player's straight, sincere reel (the non-parody option)*
> [GLOBAL STYLE] [SETTING BIBLE] A clean, sincere lifestyle reel thumbnail in the villa —
> genuine, well-shot, aspirational-but-honest, ring light and phone-on-tripod in frame, soft
> golden light. Understated and real (contrasts with the polished villa crowd). **Do not show the
> player's face** — POV/hands/over-shoulder framing. 4:5.

---

### E. Zoya DM / reaction states → used when Zoya messages you

**ch-zoya-bestie.png** — *Zoya "sweet ally" mode (camera-on warmth)*
> [GLOBAL STYLE] [ZOYA Consistency Lock] Zoya sending a warm cutesy selfie to camera in a cosy
> late-night villa kitchen, two chai mugs, soft fairy lights, heart-hands or a sweet wave,
> "hii babe 🫶" energy. Warm, disarming, friendly. 4:5.

**ch-zoya-cold.png** — *Zoya "mask off" mode (camera-off menace)*
> [GLOBAL STYLE] [ZOYA Consistency Lock] The same Zoya but mask-off: camera-off, cold flat stare,
> half-lit face in dim light, tiny knowing smirk, scrolling something incriminating on her phone,
> screen glow underlighting her. Sweet styling, cruel expression. Unsettling. 4:5.

---

### F. Reveal screenshots — phone-screenshot UI, legible text (9:19.5) → the two placeholders

These are **in-story screenshots** shown as evidence. They must look like a real phone screen
with **readable text**. gpt-image-2 can render UI + short text — keep copy short and spell it out.

**ch-crush-leak.png** — *D3-2: proof the crush is using you for votes (posted by Zoya)*
> [GLOBAL STYLE] A realistic smartphone screenshot of a private Instagram DM chat, shown as a
> leaked screenshot (slightly cropped, a red circle drawn around the key line like a gossip page
> would add). Dark-mode chat UI. The chat is with a contact named the crush, grey incoming
> bubbles reading exactly: "usse close rakhna hai" / "numbers double ho rahe hain 😌" / "abhi toh
> bas game hai". Timestamp, typing dots, generic avatar circle. Clean legible UI text, no
> misspellings. Feels like a screenshot someone wasn't meant to see. 9:19.5 phone screenshot.
>
> *(Gender note: the contact name/avatar should stay neutral — a first name or "🤍" — so it
> reads for either crush. If you prefer exactness, generate `-ananya` and `-kabir` variants with
> the respective name.)*

**ch-ria-leak.png** — *D4-3: Ria's "luxury life on credit" — sponsor DMs + unpaid dues*
> [GLOBAL STYLE] A realistic smartphone screenshot collage (two stacked phone screenshots) that
> exposes Ria's fake luxury. Top: an Instagram DM from a brand/PR account, incoming bubbles
> reading exactly: "Hi Ria, the outfit must be RETURNED within 3 days" / "This was a loan, not
> gifted 🙏". Bottom: a banking/UPI-style "Payment Failed / Dues Pending ₹ ——" notification card.
> Dark-mode UI, red circles annotating the damning lines like a gossip page. Clean legible text,
> no misspellings. Looks like real leaked evidence. 9:19.5 phone screenshot.

---

## 4. GENERATION CHECKLIST

- [ ] Prepend **GLOBAL STYLE** to every prompt; paste the exact **Consistency Lock** for each
      person in frame.
- [ ] Regenerate the whole set together in one session for a coherent grade/palette.
- [ ] **Never render the player's face**; keep crush/ally scenes face-agnostic (or make
      `-ananya`/`-kabir` variants and wire per gender).
- [ ] Reveal screenshots: verify the on-image text is spelled correctly and legible.
- [ ] Save to the exact filenames above (avatars → `public/avatars/`, rest →
      `public/generated/creator-house-posts/`) so no code rewiring is needed.
- [ ] After generating the two `-leak` screenshots, they replace the current placeholder copies.
