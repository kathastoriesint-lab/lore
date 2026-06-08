import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { access, mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const VOICE_ID = 'H6QPv2pQZDcGqLwDTIJQ'
const MODEL_ID = 'eleven_multilingual_v2'
const VOICE_SETTINGS = {
  stability: 0.2,
  similarity_boost: 0.75,
  style: 0.7,
  use_speaker_boost: true,
}
const AUDIO_DIR = join(process.cwd(), 'public', 'audio')

const hashText = (text: string) =>
  createHash('sha256')
    .update(`${VOICE_ID}|${JSON.stringify(VOICE_SETTINGS)}|${text}`)
    .digest('hex')
    .slice(0, 16)

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
