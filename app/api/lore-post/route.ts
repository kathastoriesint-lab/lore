// Server-side OpenAI route for the Creator House "make a post" flow.
//
// Two modes, both gpt-4o, both server-only (OPENAI_API_KEY never reaches the
// browser):
//   • mode:'caption'    → drafts ONE Instagram caption in a chosen vibe.
//   • mode:'reactions'  → given the posted caption, writes the house + fans'
//                         live comments (and, optionally, a private DM).
//
// The client (LiveScreen) calls this when the player composes/posts. On any
// failure we return a non-200 so the caller can fall back to the authored
// caption/reactions baked into the content JSON — the loop never breaks.

export const runtime = 'nodejs'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o'

type Vibe = 'Bold' | 'Funny' | 'Mysterious'

interface Character { id: string; name: string; persona?: string }

interface Ctx {
  playerName?: string
  day?: number
  beatTitle?: string      // e.g. "Pehla Kadam"
  sceneSummary?: string   // 1-2 lines: what just happened in the story
  choiceText?: string     // the choice the player made
  characters?: Character[] // housemates/teammates who might react
  world?: string // 'cricket' | 'creator-house' — steers voice + hashtags + fan handles
}

const VIBE_GUIDE: Record<Vibe, string> = {
  Bold: 'Confident, main-character swagger. Owns the room. A little cocky.',
  Funny: 'Witty, self-aware, playful. Lands a joke. Never tries too hard.',
  Mysterious: 'Few words. Cryptic, understated, leaves them wanting more.',
}

async function callOpenAI(system: string, user: string, maxTokens: number, model: string = MODEL) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY missing')
  const resp = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.9,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!resp.ok) {
    const t = await resp.text().catch(() => '')
    throw new Error(`openai ${resp.status}: ${t.slice(0, 200)}`)
  }
  const data = await resp.json()
  const raw = data?.choices?.[0]?.message?.content || '{}'
  return JSON.parse(raw)
}

function captionPrompt(ctx: Ctx, vibe: Vibe, language?: string) {
  const cricket = ctx.world === 'cricket'
  const identity = cricket
    ? `a 16-year-old batting prodigy who just joined Mumbai Indians (IPL)`
    : `a creator on the Indian reality show "Creator House"`
  const hashtags = cricket
    ? `#MI, #Paltan, #IPL are fair game`
    : `#Day${ctx.day || 1}, #CreatorHouse are fair game`
  const system =
    `You are the social-media voice of ${ctx.playerName || 'the player'}, ${identity}. ` +
    `Write ONE short Instagram caption in ${language === 'en' ? 'natural Gen-Z English' : 'Gen-Z Hinglish (Roman script, the way young Indians actually post)'}. ` +
    `Max ~120 characters. At most one emoji and one or two hashtags (${hashtags}). ` +
    `No quotation marks around the caption. Output strict JSON: {"caption": string}.`
  const user =
    `Scene: ${ctx.sceneSummary || 'Day 1 in the Creator House.'}\n` +
    `What the player just chose: ${ctx.choiceText || '—'}\n` +
    `Vibe to write in — ${vibe}: ${VIBE_GUIDE[vibe]}\n` +
    `Write the caption.`
  return { system, user }
}

function reactionsPrompt(ctx: Ctx, caption: string, language?: string) {
  const cricket = ctx.world === 'cricket'
  const chars = ctx.characters && ctx.characters.length
    ? ctx.characters
    : cricket
      ? [{ id: 'hardik', name: 'Hardik' }, { id: 'surya', name: 'Surya' }, { id: 'tilak', name: 'Tilak' }]
      : [{ id: 'ria', name: 'Ria' }, { id: 'ananya', name: 'Ananya' }, { id: 'kabir', name: 'Kabir' }]
  const charLines = chars.map(c => `- id:"${c.id}" name:"${c.name}"${c.persona ? ` — ${c.persona}` : ''}`).join('\n')
  const system = (cricket
    ? `You write the live comment section reacting to a young IPL cricketer's Instagram post. ` +
      `Voices: the teammates listed below (use their exact id), and fans (use id "__fan" with a believable handle as "name", e.g. paltanpulse, cricketroom_india, futurexi). `
    : `You write the live comment section reacting to a reality-show contestant's Instagram post. ` +
      `Voices: the housemates listed below (use their exact id), and fans (use id "__fan" with a believable handle as "name", e.g. housewatch_india, creator.tea, desi_reelszone). `) +
    `${language === 'en' ? 'Gen-Z English' : 'Gen-Z Hinglish, Roman script'}, short (a few words each), realistic — some hyped, some shady, reactions should fit what the player just posted/did. ` +
    `Return 4 to 6 comments. Output strict JSON: {"reactions":[{"char":string,"name":string,"text":string}]}. ` +
    `For housemates set char to their id and name to their name; for fans set char to "__fan" and name to the handle.`
  const user =
    `The player (${ctx.playerName || 'player'}) just posted: "${caption}"\n` +
    `Context: ${ctx.sceneSummary || 'Day 1, Creator House.'} They chose: ${ctx.choiceText || '—'}.\n` +
    `Housemates who might comment:\n${charLines}\n` +
    `Write the comments.`
  return { system, user }
}

// Two short comment suggestions the PLAYER would leave on someone else's post.
// World-aware: cricket = you are a young MI debutant, voice + tone matched to who
// posted (senior vs fan-page vs peer); creator-house = a reality-show viewer.
function commentSuggestPrompt(world: string | undefined, character: { name?: string; persona?: string }, caption: string, language?: string) {
  const poster = `${character?.name || 'someone'}${character?.persona ? ` (${character.persona})` : ''}`
  if (world === 'cricket') {
    const system =
      `You are a 16-year-old Mumbai Indians debutant scrolling your cricket feed. ` +
      `Write EXACTLY 2 short, distinct comments YOU would leave on this post, in ${language === 'en' ? 'natural Gen-Z English' : 'natural Gen-Z Indian-cricket Hinglish (Roman script)'}. ` +
      `Match the relationship to who posted: to a SENIOR or coach → respectful, warm, a little starstruck — NEVER cheeky, teasing or disrespectful; ` +
      `to a fan / media page → grateful or a humble hype-back; to a peer or rival → friendly banter with a small edge. ` +
      `Comment #1 = genuine / warm; #2 = lighter, more personality. Each under ~10 words. ` +
      `At most one emoji each, no hashtags. Output strict JSON {"suggestions":[string,string]}.`
    const user = `The post is by ${poster}. Caption: "${caption}". Write the 2 comments in your own voice as the young player.`
    return { system, user }
  }
  const system =
    `You write short Instagram comments a viewer would leave on a reality-show creator's photo. ` +
    `${language === 'en' ? 'Gen-Z English' : 'Gen-Z Hinglish (Roman script)'}. Return EXACTLY 2 short, distinct comments: #1 hype/supportive, #2 cheeky/spicy/teasing. ` +
    `At most one emoji each, no hashtags. Output strict JSON {"suggestions":[string,string]}.`
  const user = `Post by ${poster}. Caption: "${caption}". Write the 2 comments.`
  return { system, user }
}

// The character's reaction to the player's comment: tone bucket + an in-character DM.
// World-aware so a cricket senior doesn't reply like a reality-show contestant.
function commentReactPrompt(world: string | undefined, character: { name?: string; persona?: string }, caption: string, comment: string, language?: string) {
  if (world === 'cricket') {
    const system =
      `You ARE ${character?.name || 'a cricketer'} (${character?.persona || 'a Mumbai Indians player'}). ` +
      `A young MI teammate / debutant just commented on your post. First classify their comment toward you as EXACTLY one of:\n` +
      `- "positive": genuine respect, support, or warmth.\n` +
      `- "negative": rude, cocky, or disrespectful to a senior.\n` +
      `- "spicy": cheeky banter, a bit forward or provocative — playful, not cruel.\n` +
      `- "boring": generic, low-effort ("nice", "👍", "well played", "🔥").\n` +
      `Then write the short DM you'd send back — your voice, ${language === 'en' ? 'Gen-Z English' : 'Gen-Z Indian-cricket Hinglish'}, 1-2 short lines:\n` +
      `- positive → warm, encouraging, senior-to-junior; make the kid's day.\n` +
      `- negative → a measured put-down or cool distance — you're the senior, you don't flare up.\n` +
      `- spicy → amused, give it back, keep the kid in their place with a smile.\n` +
      `- boring → curt, barely engaged (e.g. "hmm." / "ok kid").\n` +
      `Output strict JSON {"sentiment":"positive|negative|spicy|boring","reply":string}.`
    const user = `Your post caption: "${caption}". The player's comment: "${comment}". React as a DM.`
    return { system, user }
  }
  const system =
    `You ARE ${character?.name || 'a creator'}, a contestant on the Indian reality show "Creator House". ` +
    `Persona: ${character?.persona || 'a creator'}. A viewer just commented on your post. ` +
    `First classify their comment toward you as EXACTLY one of:\n` +
    `- "positive": genuine support, hype, or love.\n` +
    `- "negative": rude, insulting, or hurtful.\n` +
    `- "spicy": provocative, teasing, shady, flirty — stirs drama without being outright cruel.\n` +
    `- "boring": generic, low-effort, forgettable ("nice", "👍", "first", "cool").\n` +
    `Then write the DM you would send reacting to it — in your voice, ${language === 'en' ? 'Gen-Z English' : 'Gen-Z Hinglish'}, 1-2 short lines:\n` +
    `- positive → warm, grateful, or flirty per your persona.\n` +
    `- negative → confrontational or hurt, in your style (e.g. "wtf why would you say that…").\n` +
    `- spicy → intrigued / playful / heat — match their energy, give them something back.\n` +
    `- boring → barely bothered, curt or dismissive (e.g. "k." / "thanks ig"); keep it ultra short.\n` +
    `Output strict JSON {"sentiment":"positive|negative|spicy|boring","reply":string}.`
  const user = `Your post caption: "${caption}". The viewer's comment: "${comment}". React as a DM.`
  return { system, user }
}

export async function POST(req: Request) {
  let body: { mode?: string; vibe?: Vibe; caption?: string; comment?: string; character?: { name?: string; persona?: string }; ctx?: Ctx; world?: string; language?: string } = {}
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'bad json' }, { status: 400 })
  }
  const ctx = body.ctx || {}

  try {
    if (body.mode === 'caption') {
      const vibe: Vibe = (['Bold', 'Funny', 'Mysterious'] as Vibe[]).includes(body.vibe as Vibe)
        ? (body.vibe as Vibe)
        : 'Bold'
      const { system, user } = captionPrompt(ctx, vibe, body.language)
      const out = await callOpenAI(system, user, 120)
      const caption = typeof out?.caption === 'string' ? out.caption.trim() : ''
      if (!caption) throw new Error('empty caption')
      return Response.json({ caption })
    }

    if (body.mode === 'reactions') {
      const caption = (body.caption || '').trim()
      if (!caption) return Response.json({ error: 'no caption' }, { status: 400 })
      const { system, user } = reactionsPrompt(ctx, caption, body.language)
      const out = await callOpenAI(system, user, 500)
      const reactions = Array.isArray(out?.reactions)
        ? out.reactions
            .filter((r: any) => r && typeof r.text === 'string' && r.text.trim())
            .map((r: any) => ({
              char: typeof r.char === 'string' && r.char ? r.char : '__fan',
              name: typeof r.name === 'string' ? r.name : undefined,
              text: String(r.text).trim(),
            }))
            .slice(0, 6)
        : []
      if (!reactions.length) throw new Error('empty reactions')
      return Response.json({ reactions })
    }

    if (body.mode === 'comment-suggest') {
      const { system, user } = commentSuggestPrompt(body.world ?? body.ctx?.world, body.character || {}, (body.caption || '').trim(), body.language)
      const out = await callOpenAI(system, user, 120, 'gpt-4o-mini')
      const suggestions = Array.isArray(out?.suggestions)
        ? out.suggestions.filter((s: unknown) => typeof s === 'string' && s.trim()).map((s: string) => s.trim()).slice(0, 2)
        : []
      if (!suggestions.length) throw new Error('empty suggestions')
      return Response.json({ suggestions })
    }

    if (body.mode === 'comment-react') {
      const comment = (body.comment || '').trim()
      if (!comment) return Response.json({ error: 'no comment' }, { status: 400 })
      const { system, user } = commentReactPrompt(body.world ?? body.ctx?.world, body.character || {}, (body.caption || '').trim(), comment, body.language)
      const out = await callOpenAI(system, user, 160, 'gpt-4o-mini')
      const sentiment = ['positive', 'negative', 'spicy', 'boring'].includes(out?.sentiment) ? out.sentiment : 'boring'
      const reply = typeof out?.reply === 'string' ? out.reply.trim() : ''
      if (!reply) throw new Error('empty reply')
      return Response.json({ sentiment, reply })
    }

    return Response.json({ error: 'unknown mode' }, { status: 400 })
  } catch (e: any) {
    // Non-200 → caller falls back to authored content.
    return Response.json({ error: String(e?.message || e) }, { status: 502 })
  }
}
