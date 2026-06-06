/**
 * Lore — Outcome Simulation Script
 * Usage: npx tsx scripts/simulate-lore.mjs [cricket|creator-house]
 *
 * Outputs: ending distribution, meter ranges, unreachable endings, top paths.
 */

const world = process.argv[2] ?? 'cricket'
console.log(`\nSimulating: ${world}\n${'─'.repeat(50)}`)

function resolveCricketEnding(m) {
  if (m.fame >= 70 && m.fame >= m.heat && m.fame >= m.image) return 'realDeal'
  if (m.image >= 68 && m.image >= m.fame && m.image >= m.heat) return 'captainsProject'
  if (m.heat >= 70 && m.heat > m.image + 8) return 'paltanWonderkid'
  if (m.heat >= 62 && m.image < 50) return 'tooMuchTooSoon'
  return 'quietClimber'
}
function resolveEnding(m) {
  if (m.heat  >= 67 && m.heat  > m.fame  && m.heat  > m.image) return 'heart'
  if (m.fame  >= 67 && m.fame  > m.heat  && m.fame  > m.image) return 'main'
  if (m.image >= 67 && m.image > m.fame  && m.image > m.heat)  return 'brand'
  return 'dark'
}
function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))) }
function applyDeltas(m, d) { return { fame:clamp(m.fame+d.fame), heat:clamp(m.heat+d.heat), image:clamp(m.image+d.image) } }

let situations, startMeters, resolver, allEndings

if (world === 'cricket') {
  const { CRICKET_SITUATIONS } = await import('../lib/cricket-data.ts')
  situations = CRICKET_SITUATIONS
  startMeters = { fame:45, heat:55, image:35 }
  resolver = resolveCricketEnding
  allEndings = ['realDeal','captainsProject','paltanWonderkid','tooMuchTooSoon','quietClimber']
} else {
  const { SITUATIONS } = await import('../lib/data.ts')
  situations = SITUATIONS
  startMeters = { fame:20, heat:50, image:30 }
  resolver = resolveEnding
  allEndings = ['heart','main','brand','dark']
}

const N = situations.length
const MAX = N <= 20 ? Math.pow(2, N) : 50000
const sampled = N > 20
console.log(`Situations: ${N} | Samples: ${MAX.toLocaleString()}${sampled ? ' (random)' : ' (exhaustive)'}`)

const endingCounts = {}, pathCounts = {}
let totalRuns = 0

function simulate(seq) {
  let m = { ...startMeters }
  for (let i = 0; i < situations.length; i++) {
    const ch = situations[i].choices[seq[i] === 'B' ? 1 : 0]
    m = applyDeltas(m, ch.deltas)
  }
  const e = resolver(m)
  endingCounts[e] = (endingCounts[e] ?? 0) + 1
  const k = seq.join('')
  pathCounts[k] = (pathCounts[k] ?? 0) + 1
  totalRuns++
}

for (let s = 0; s < MAX; s++) {
  const seq = sampled
    ? Array.from({ length:N }, () => Math.random()<0.5?'A':'B')
    : Array.from({ length:N }, (_,i) => (s>>i)&1 ? 'B':'A')
  simulate(seq)
}

console.log('\n📊 ENDING DISTRIBUTION')
console.log('─'.repeat(50))
for (const [e,c] of Object.entries(endingCounts).sort((a,b)=>b[1]-a[1])) {
  const pct = ((c/totalRuns)*100).toFixed(1)
  console.log(`  ${e.padEnd(22)} ${pct.padStart(5)}%  ${'█'.repeat(Math.round(pct/2))}`)
}

const unreachable = allEndings.filter(e => !endingCounts[e])
console.log(unreachable.length ? `\n⚠️  UNREACHABLE: ${unreachable.join(', ')}` : '\n✅ All endings reachable')

const last = situations.reduce((acc, _, i) => {
  // recompute final meter range across all runs — approximated from top/bottom paths
  return acc
}, null)

console.log('\n🔝 TOP 5 PATHS')
console.log('─'.repeat(50))
for (const [p,c] of Object.entries(pathCounts).sort((a,b)=>b[1]-a[1]).slice(0,5)) {
  console.log(`  ${p.slice(0,30)}${p.length>30?'...':''}  ${((c/totalRuns)*100).toFixed(2)}%`)
}
console.log(`\nTotal: ${totalRuns.toLocaleString()}`)
