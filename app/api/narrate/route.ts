import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { access, mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { VOICE_ID, MODEL_ID, VOICE_SETTINGS, cacheKeyInput } from '@/lib/voice'

const AUDIO_DIR = join(process.cwd(), 'public', 'audio')

// Require a valid Supabase session (read from the cookie the app sets) so this
// paid ElevenLabs endpoint can't be called anonymously. Returns the user or null.
async function getSessionUser() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
    )
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

// Best-effort per-user rate limit (in-memory; resets per instance / on cold start).
// Caps rapid abuse of the paid TTS API. Durable limiting would need Vercel KV/Upstash.
const RATE_MAX = 30
const RATE_WINDOW_MS = 60_000
const rateHits = new Map<string, number[]>()
function rateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (rateHits.get(key) ?? []).filter(t => now - t < RATE_WINDOW_MS)
  recent.push(now)
  rateHits.set(key, recent)
  return recent.length > RATE_MAX
}

const hashText = (text: string) =>
  createHash('sha256').update(cacheKeyInput(text)).digest('hex').slice(0, 16)

const fileExists = async (path: string) => {
  try { await access(path); return true } catch { return false }
}

async function fetchFromElevenLabs(text: string, apiKey: string): Promise<Buffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS }),
  })
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

export async function POST(req: NextRequest) {
  // Auth: only logged-in (incl. anonymous) app sessions may call this paid route.
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (rateLimited(user.id)) {
    return NextResponse.json({ error: 'rate limited' }, { status: 429 })
  }

  let text: string
  try {
    const body = await req.json()
    text = body.text
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }
  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'text required' }, { status: 400 })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 })
  }

  const filepath = join(AUDIO_DIR, `${hashText(text)}.mp3`)

  let audio: Buffer
  if (await fileExists(filepath)) {
    audio = await readFile(filepath)
  } else {
    try {
      audio = await fetchFromElevenLabs(text, apiKey)
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : 'unknown' }, { status: 502 })
    }
    // Cache to disk (silently no-op on read-only filesystems like Vercel prod)
    try {
      await mkdir(AUDIO_DIR, { recursive: true })
      await writeFile(filepath, audio)
    } catch {}
  }

  return new NextResponse(new Uint8Array(audio), {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': audio.length.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
