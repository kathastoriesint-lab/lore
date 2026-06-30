import fs from 'fs'
import path from 'path'

// Load OPENAI_API_KEY from .env.local (no dotenv dep)
const env = fs.readFileSync('.env.local', 'utf8')
const KEY = (env.match(/^OPENAI_API_KEY=(.+)$/m) || [])[1]?.trim()
if (!KEY) { console.error('No OPENAI_API_KEY in .env.local'); process.exit(1) }

const OUT = path.resolve('public/generated/creator-house-posts')
fs.mkdirSync(OUT, { recursive: true })

const STYLE = 'cinematic lifestyle photography, photorealistic, warm golden-hour tones, Indian creator aesthetic, no visible text, no logos, no watermarks, Instagram aesthetic, soft bokeh background'

// Back-of-character framing keeps faces out of frame so identity stays consistent across renders.
const posts = [
  {
    file: 'ch-reel-parody.png',
    prompt: `Two young Indian content creators seen FROM BEHIND, backs to the camera, faces completely out of frame, inside a luxury Goa villa lounge, filming a funny parody reel into a ring-lit smartphone on a tripod, both striking exaggerated over-the-top dramatic poses mocking a glamorous luxury-lifestyle influencer, one creator holding a skincare product box up toward the phone, warm golden interior light, ring light glow, playful chaotic comedic energy, motion blur of laughter, behind-the-scenes Instagram reel vibe. ${STYLE}`,
  },
  {
    file: 'ch-reel-clean.png',
    prompt: `Two young Indian content creators seen FROM BEHIND, backs to the camera, faces completely out of frame, inside a luxury Goa villa lounge, filming a clean polished brand-collaboration reel into a ring-lit smartphone on a tripod, holding a skincare product elegantly toward the camera, calm composed professional posture, warm golden light, premium aspirational brand-deal aesthetic, tasteful and minimal. ${STYLE}`,
  },
]

console.log(`Generating ${posts.length} Beat 2 reel images via OpenAI images API...\n`)
for (const post of posts) {
  console.log(`Generating ${post.file}...`)
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-1', prompt: post.prompt, size: '1024x1536', quality: 'high', n: 1 }),
    })
    const json = await res.json()
    if (!res.ok) { console.error(`  ✗ ${post.file}: ${res.status} ${JSON.stringify(json).slice(0,200)}`); continue }
    const b64 = json.data?.[0]?.b64_json
    if (!b64) { console.error(`  ✗ ${post.file}: no b64 in response`); continue }
    fs.writeFileSync(path.join(OUT, post.file), Buffer.from(b64, 'base64'))
    console.log(`  ✓ ${post.file}`)
  } catch (e) {
    console.error(`  ✗ ${post.file}: ${e.message}`)
  }
}
console.log('\nDone.')
