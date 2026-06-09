import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const OUT = '/Users/nabhgarg/Desktop/Katha_MVP/lore-next/public/generated/creator-house-posts'
fs.mkdirSync(OUT, { recursive: true })

const STYLE = 'cinematic lifestyle photography, photorealistic, warm golden-hour tones, Indian creator aesthetic, no visible text, no logos, no watermarks, Instagram aesthetic, soft bokeh background'

const posts = [
  {
    file: 'seed-ria.png',
    prompt: `Editorial fashion photograph of a young Indian woman in a designer white silk outfit standing on a luxury Goa villa terrace with an infinity pool behind her, golden hour backlight, curated and perfect composition, seen from behind or three-quarter profile with face not clearly visible, warm amber and gold tones, aspirational luxury lifestyle influencer aesthetic, tropical lush greenery. ${STYLE}`
  },
  {
    file: 'seed-kabir.png',
    prompt: `Candid lifestyle photograph inside a luxury Goa villa living room, a young Indian man in casual streetwear mid-laugh sitting on a designer sofa, ring light glowing in background, phone held casually, content creator home studio vibe, authentic relaxed Mumbai street energy, warm amber interior lighting, face partially in shadow, natural and unposed. ${STYLE}`
  },
  {
    file: 'seed-ananya.png',
    prompt: `Dynamic dance photography of a young Indian woman mid-movement on a wide Goa villa terrace at golden hour, arms extended, loose flowy outfit catching the warm sunset breeze, authentic emotional expression, strong backlight creating a silhouette halo effect, dance content creator aesthetic, artistic and real, ground-level shot looking slightly upward. ${STYLE}`
  },
  {
    file: 'seed-dev.png',
    prompt: `Fitness lifestyle photography of a young Indian man doing push-ups on a luxury Goa villa poolside deck at sunrise, golden morning light casting long shadows, athletic build in training clothes, determined energy, no face clearly visible shot from side or above, motivational fitness influencer aesthetic, pool and tropical garden softly blurred behind. ${STYLE}`
  },
  {
    file: 'seed-zoya.png',
    prompt: `Beauty and lifestyle flat-lay photography on a marble vanity table in a luxury Goa villa room, elegant skincare and makeup products arranged in a perfect arc, a young Indian woman's manicured hand reaching into frame adjusting a product, ring light glowing warmly in the mirror reflection, perfectly curated Instagram beauty creator aesthetic, soft warm rose-gold tones, ASMR beauty influencer mood. ${STYLE}`
  },
  {
    file: 'seed-villa.png',
    prompt: `Luxury Goa villa exterior at golden dusk seen from the poolside, Portuguese colonial architecture with modern additions, large glass sliding doors with ring lights glowing warmly inside, swimming pool reflecting the amber sky, lush tropical garden surrounds the space, several ring light setups visible through glass, content creator house aesthetic, cinematic wide establishing shot, no people visible, moody and cinematic. ${STYLE}`
  },
  {
    file: 'scene-terrace-night.png',
    prompt: `Luxury Goa villa rooftop terrace at night, string fairy lights draped overhead, two empty chairs facing a dark ocean horizon, city lights faintly visible below, warm intimate ambient glow from fairy lights, late-night confession mood, quiet and cinematic, no people, emotional and atmospheric. ${STYLE}`
  },
  {
    file: 'scene-challenge.png',
    prompt: `Modern content creator filming setup inside a luxury villa living room, a professional camera on a tripod facing a ring-lit backdrop, brand products arranged on a table in the foreground, warm studio lighting mixed with golden afternoon light through large windows, brand challenge competition energy, clean and cinematic, no people. ${STYLE}`
  },
]

console.log(`Generating ${posts.length} Creator House images...\n`)
for (const post of posts) {
  console.log(`Generating ${post.file}...`)
  try {
    const res = await client.images.generate({
      model: 'gpt-image-1',
      prompt: post.prompt,
      size: '1024x1536',
      quality: 'high',
      n: 1,
    })
    const b64 = res.data[0].b64_json
    fs.writeFileSync(path.join(OUT, post.file), Buffer.from(b64, 'base64'))
    console.log(`  ✓ ${post.file}`)
  } catch (e) {
    console.error(`  ✗ ${post.file}: ${e.message}`)
  }
}
console.log('\nDone.')
