// One-shot image optimizer. Re-encodes app images (public/avatars, public/generated)
// as WebP bytes IN PLACE, keeping the .png filenames. Browsers and WebViews sniff
// image content and render by actual bytes regardless of the .png extension, so no
// code references change. Also resizes to display dimensions (the dominant win):
//   - character portrait avatars display at <=120px  -> cap 384px
//   - full-bleed scene backgrounds fill the phone     -> cap 1200px
//   - feed/reader post images display at phone width  -> cap 1080px
// Idempotent-ish: WebP re-encode of an already-webp .png is a near-noop.
import sharp from 'sharp'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

function walk(dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(p))
    else if (e.name.toLowerCase().endsWith('.png')) out.push(p)
  }
  return out
}

const SCENE = /(^|\/)(scene-|seed-)|villa|terrace|challenge|dressing-room|cricket-nets|wankhede/i

function capFor(path, meta) {
  if (path.includes('/generated/')) return 1080
  // /avatars: scenes stay large, character portraits shrink hard
  if (SCENE.test(path)) return 1200
  return 384
}

const files = [...walk('public/avatars'), ...walk('public/generated')]
let before = 0, after = 0, n = 0
for (const f of files) {
  const b = statSync(f).size
  const meta = await sharp(f).metadata()
  const cap = capFor(f, meta)
  const longest = Math.max(meta.width || 0, meta.height || 0)
  const resize = longest > cap ? (meta.width >= meta.height ? { width: cap } : { height: cap }) : undefined
  const buf = await sharp(f).rotate().resize(resize).webp({ quality: 80, effort: 5 }).toBuffer()
  const { writeFileSync } = await import('node:fs')
  writeFileSync(f, buf)
  before += b; after += buf.length; n++
}
const mb = x => (x / 1048576).toFixed(1) + 'M'
console.log(`converted ${n} images: ${mb(before)} -> ${mb(after)} (${(before / after).toFixed(1)}x smaller)`)
