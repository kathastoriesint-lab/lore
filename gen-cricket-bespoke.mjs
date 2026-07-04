import fs from 'fs'
import path from 'path'
const env = fs.readFileSync('.env.local','utf8')
const KEY = (env.match(/^OPENAI_API_KEY=(.+)$/m)||[])[1]?.trim()
if(!KEY){console.error('No OPENAI_API_KEY');process.exit(1)}
const OUT = path.resolve('public/generated/cricket-posts')
fs.mkdirSync(OUT,{recursive:true})

// Shared cinematic look — matches the existing cr2-* bespoke set. Anonymity: the
// player's face is always turned away / shadowed / out of frame.
const S = 'Cinematic sports photography, photorealistic, moody dramatic film lighting, Mumbai Indians deep-blue and gold colour palette, shallow depth of field, subtle film grain, rich detail. The main figure is a lean 16-year-old Indian male cricketer — keep his face turned away, in shadow, or partly out of frame so he is not identifiable. Absolutely NO readable text, NO logos, NO watermarks, NO readable names or numbers on any jersey.'

const imgs = [
  // ── main beat scenes ──
  { f:'cr2-s1-auction.png',   p:`Auction night. A teenage boy sits on the floor of a modest middle-class Indian living room, back to camera, watching an IPL player-auction on an old TV that lights the dark room blue. His parents behind him, hands to their mouths, frozen between disbelief and joy. Intimate, emotional, the moment a life changes. ${S}` },
  { f:'cr2-s2-nets.png',      p:`Wankhede practice nets, late afternoon golden light. A young batter in blue training kit crouches into his stance as a fast bowler's delivery blurs toward him, dust kicking off the pitch. Senior players watch from behind the net, arms folded, judging. Tense first-test-of-nerve energy. ${S}` },
  { f:'cr2-s4-role.png',      p:`Inside a dim IPL dressing room. A broad-shouldered captain (seen from behind) leans down talking quietly to a young player sitting on the bench, kit half on. Warm low tungsten light, jerseys hanging, a private mentorship-or-warning moment, heavy with meaning. ${S}` },
  { f:'cr2-s7-debut.png',     p:`Debut night. A young batter walks out to the middle of a packed Wankhede Stadium under blazing floodlights, seen from behind, bat in hand, tiny against a roaring blue crowd. Long shadows, epic scale, terrified grandeur. ${S}` },
  { f:'cr2-s9-fall.png',      p:`Late night, a young cricketer alone in a dark hotel room lit only by the harsh glow of his phone, a story breaking on screen. Head bowed, face in shadow, the weight of sudden bad press. Cold blue light, isolation, the fall after the hype. ${S}` },
  { f:'cr2-s10-selection.png',p:`A selection meeting. On a table under a desk lamp lies a printed batting form-sheet with columns of numbers (illegible), a coach's hands resting on it. A young player waits across the table, out of focus, anxious. Over-the-shoulder framing, clinical and tense. ${S}` },
  { f:'cr2-s11-gym.png',      p:`An empty hotel gym at 2 a.m. A lone young cricketer works out under a single cold overhead light, the rest of the room black. Sweat, discipline, solitude — grinding back alone. ${S}` },
  { f:'cr2-s12-rivalry.png',  p:`Two young batters in blue training kit at adjacent practice nets, glancing sideways at each other with quiet competitive tension — one middle-order slot, two rivals. Split composition, charged air, dusk light. ${S}` },
  { f:'cr2-s13-eliminator.png',p:`Do-or-die last over of a knockout match. A batter stands at the crease under floodlights, chest heaving, a blurred scoreboard glowing high in the background. Sweat, pressure, the whole season on one moment. ${S}` },
  { f:'cr2-s14-verdict.png',  p:`India squad selection day. A young cricketer sits very still in a quiet room, staring at a phone face-down on the table, morning light through a window. Hope and dread held in one breath, the call about to come. ${S}` },
  // ── benched / lifeline / mentorship variant scenes ──
  { f:'cr2-s5-benched.png',   p:`Dressing room, team-sheet moment. A young player stands reading a printed XI pinned to the board, shoulders dropping — his name is not on it. Others celebrate softly behind, out of focus. Quiet devastation. ${S}` },
  { f:'cr2-s6-benched.png',   p:`Match morning as 12th man. A young cricketer in a training bib carries a tray of drinks and towels along the boundary rope, watching the playing eleven warm up in the distance. Sidelined, useful but unseen. ${S}` },
  { f:'cr2-s7-benched.png',   p:`The dugout during a live match. A young substitute sits forward on the bench, elbows on knees, watching the game intently under floodlights, willing his chance to come. Reserve-player tension. ${S}` },
  { f:'cr2-s10-benched.png',  p:`After being dropped. A young player in a corridor outside the team room, leaning on a wall, a rival walking past in the background. Subdued, swallowing pride, plotting the way back. ${S}` },
  { f:'cr2-s11-rohit.png',    p:`Dawn, an empty stadium. A senior batsman (seen from behind) throws balls to a young player at solo early-morning nets, mist on the outfield, first light. Rare, earned one-on-one mentorship. ${S}` },
  { f:'cr2-s13-benched.png',  p:`Knockout match from the sidelines. A benched young player leans in to the captain near the boundary, gesturing, giving a death-overs plan — engaged and valued despite not being in the XI. Floodlights, urgency. ${S}` },
  // ── feed-reaction images ──
  { f:'cr2-s2-fan.png',       p:`A sea of Mumbai Indians fans in blue jerseys packed into a stadium stand, arms up, roaring, one big handmade banner (no readable text), electric fan-culture energy. Vibrant, hype, social-media worthy. ${S}` },
  { f:'cr2-s3-feed.png',      p:`A press-conference stage: a young cricketer at a table behind a cluster of microphones and a blank sponsor backdrop, cameras flashing, seen from the side so his face is turned. Media-day spotlight, the newest story in the room. ${S}` },
]

console.log(`Generating ${imgs.length} bespoke cricket images with gpt-image-2...\n`)
let ok=0, fail=[]
for(const it of imgs){
  let done=false
  for(let attempt=1; attempt<=2 && !done; attempt++){
    try{
      const res = await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:`Bearer ${KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-image-2',prompt:it.p,size:'1024x1536',quality:'high',n:1})})
      const j = await res.json()
      if(!res.ok){ console.error(`  ✗ ${it.f} (try ${attempt}): ${res.status} ${JSON.stringify(j).slice(0,140)}`); continue }
      const b64=j.data?.[0]?.b64_json
      if(!b64){ console.error(`  ✗ ${it.f}: no b64`); continue }
      fs.writeFileSync(path.join(OUT,it.f),Buffer.from(b64,'base64'))
      console.log(`  ✓ ${it.f}  (${ok+1}/${imgs.length})`)
      ok++; done=true
    }catch(e){ console.error(`  ✗ ${it.f} (try ${attempt}): ${e.message}`) }
  }
  if(!done) fail.push(it.f)
}
console.log(`\nDone. ${ok}/${imgs.length} generated.` + (fail.length?` FAILED: ${fail.join(', ')}`:''))
