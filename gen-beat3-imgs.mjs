import fs from 'fs'
import path from 'path'

const env = fs.readFileSync('.env.local', 'utf8')
const KEY = (env.match(/^OPENAI_API_KEY=(.+)$/m) || [])[1]?.trim()
if (!KEY) { console.error('No OPENAI_API_KEY'); process.exit(1) }
const OUT = path.resolve('public/generated/creator-house-posts')
fs.mkdirSync(OUT, { recursive: true })
const STYLE = 'cinematic lifestyle photography, photorealistic, warm tones, Indian creator aesthetic, no visible text, no logos, no watermarks, Instagram aesthetic, soft bokeh background'

const posts = [
  {
    file: 'ch-zoya-bestie.png',
    // Choice B: Zoya's "new bestie found" arm-in-arm post. Back/side framing for face consistency.
    prompt: `Two young Indian content creators arm-in-arm, seen from behind and slightly to the side so faces are not clearly visible, taking a fun close selfie together on a luxury Goa villa terrace at night with warm string fairy lights, playful new-best-friends energy, leaning into each other mid-laugh, cozy and candid, Instagram aesthetic. ${STYLE}`,
  },
  {
    file: 'ch-zoya-cold.png',
    // Choice A: Zoya's cold public callout post after being snubbed.
    prompt: `A young Indian woman seen from behind on a luxury Goa villa terrace at night, arms crossed, cold distant body language, looking away over the railing into the dark, isolated and unimpressed, moody low warm light, a quiet sense of betrayal and disappointment, face not visible. ${STYLE}`,
  },
]

console.log(`Generating ${posts.length} Beat 3 images...\n`)
for (const post of posts) {
  console.log(`Generating ${post.file}...`)
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-1', prompt: post.prompt, size: '1024x1536', quality: 'high', n: 1 }),
    })
    const json = await res.json()
    if (!res.ok) { console.error(`  ✗ ${post.file}: ${res.status} ${JSON.stringify(json).slice(0,160)}`); continue }
    const b64 = json.data?.[0]?.b64_json
    if (!b64) { console.error(`  ✗ ${post.file}: no b64`); continue }
    fs.writeFileSync(path.join(OUT, post.file), Buffer.from(b64, 'base64'))
    console.log(`  ✓ ${post.file}`)
  } catch (e) { console.error(`  ✗ ${post.file}: ${e.message}`) }
}
console.log('\nDone.')
