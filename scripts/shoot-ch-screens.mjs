import puppeteer from 'puppeteer'

const OUT = '/Users/smritichhattani/Downloads/creator-house-day1/screenshots'
const URL = 'http://localhost:3000/'
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 900, height: 950, deviceScaleFactor: 2 })

async function clickText(re, root = 'body') {
  return await page.evaluate((reSrc, root) => {
    const rx = new RegExp(reSrc, 'i')
    const scope = document.querySelector(root) || document
    const b = [...scope.querySelectorAll('button')].filter(b => b.offsetParent !== null).find(b => rx.test(b.textContent || ''))
    if (b) { b.click(); return true } return false
  }, re.source, root)
}
async function activeId() { return await page.evaluate(() => document.querySelector('.screen.active')?.id) }
async function dismissCoach() { // first-time tutorial overlay on the Live screen
  for (let i = 0; i < 6; i++) {
    const clicked = await page.evaluate(() => {
      const a = document.querySelector('#s-live'); if (!a) return false
      const skip = [...a.querySelectorAll('button')].find(b => b.offsetParent !== null && /^\s*skip\s*$/i.test(b.textContent))
      const got = [...a.querySelectorAll('button')].find(b => b.offsetParent !== null && /got it/i.test(b.textContent))
      const btn = skip || got; if (btn) { btn.click(); return true } return false
    })
    if (!clicked) break
    await sleep(400)
  }
}
async function shoot(name) {
  await dismissCoach()
  const el = await page.$('.phone')
  await (el || page).screenshot({ path: `${OUT}/${name}.png` })
  console.log('  📸', name, '(', await activeId(), ')')
}
async function clickCH() {
  await page.evaluate(() => {
    const node = [...document.querySelectorAll('*')].find(n => n.offsetParent !== null && [...n.childNodes].some(c => c.nodeType === 3 && c.textContent.includes('Creator House')))
    let t = node; while (t && !(t.className && /lo-press|world|card/i.test(t.className.toString()))) t = t.parentElement
    ;(t || node)?.click()
  })
}
async function fillOnboarding() {
  await page.evaluate(() => {
    const ob = document.querySelector('#s-onboarding'); const input = ob?.querySelector('input')
    if (input) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(input, 'Nabh'); input.dispatchEvent(new Event('input', { bubbles: true })) }
  })
  await sleep(300); await clickText(/^male$/); await sleep(300); await clickText(/choose your world/); await sleep(1300)
}
// Robust loop: handle whatever screen appears until we're on the FEED with a real story banner.
async function reachGame() {
  for (let i = 0; i < 16; i++) {
    const id = await activeId()
    if (id === 's-feed') {
      const ok = await page.evaluate(() => !!document.querySelector('.le-cta, .story-drop'))
      if (ok) return true
    }
    if (id === 's-login') { await clickText(/another method/); await sleep(500); await clickText(/guest/); await sleep(1400) }
    else if (id === 's-onboarding') { await fillOnboarding() }
    else if (id === 's-worlds') { await clickCH(); await sleep(1300) }
    else if (id === 's-world-intro') { if (!await clickText(/enter the house/, '#s-world-intro')) await clickText(/skip/, '#s-world-intro'); await sleep(1300) }
    else if (id === 's-narrator') { await clickText(/kadam rakho/); await sleep(1300) }
    else { await sleep(800) }
  }
  return false
}
async function enterLive() {
  await page.evaluate(() => { const c = [...document.querySelectorAll('.le-cta, .story-drop')].find(e => e.offsetParent !== null); c?.click() })
  await sleep(1300)
}
async function revealAll() {
  for (let i = 0; i < 10; i++) {
    const more = await page.evaluate(() => {
      if (!/tap anywhere/i.test(document.querySelector('#s-live')?.innerText || '')) return false
      document.querySelector('#s-live .live-scroll')?.click(); return true
    })
    if (!more) break
    await sleep(380)
  }
}
async function tab(name) {
  await page.evaluate((n) => { const t = [...document.querySelectorAll('.tabbar .tab')].find(x => new RegExp(n, 'i').test(x.textContent) && x.offsetParent !== null); t?.click() }, name)
  await sleep(1200)
}

console.log('Driving Creator House flow…')
await page.goto(URL, { waitUntil: 'networkidle2' }); await sleep(1500)
await shoot('01-login')
await clickText(/another method/); await sleep(600); await shoot('02-login-options')

console.log('Reaching a real game (handling onboarding/queue)…')
const ok = await reachGame()
console.log('  reached feed with story banner:', ok)
await shoot('03-feed')   // followers-only feed

// Beat 1
await enterLive(); await shoot('04-beat1-intro')
await revealAll(); await shoot('05-beat1-choices')
await clickText(/loud entry/, '#s-live'); await sleep(2800)
await page.evaluate(() => { const sc = document.querySelector('#s-live .live-scroll'); if (sc) sc.scrollTop = sc.scrollHeight * 0.4 }); await sleep(500)
await shoot('06-beat1-followers-receipt')
await page.evaluate(() => { const sc = document.querySelector('#s-live .live-scroll'); if (sc) sc.scrollTop = sc.scrollHeight }); await sleep(500)
await shoot('07-beat1-post-reactions')

// Beat 2
await clickText(/^next/, '#s-live'); await sleep(1900); await shoot('08-beat2-intro')
await revealAll(); await shoot('09-beat2-choices')
await clickText(/parody reel banao/, '#s-live'); await sleep(2800)
await clickText(/^next/, '#s-live'); await sleep(1900)

// Beat 3
await shoot('10-beat3-intro')
await revealAll(); await shoot('11-beat3-choices')
await clickText(/zoya ke saath baitho/, '#s-live'); await sleep(2800)
await shoot('12-beat3-outcome')

// Feed (with posts), Messages, DM thread, Profile
await tab('Feed'); await shoot('13-feed-with-posts')
await tab('Messages'); await shoot('14-messages-inbox')
await page.evaluate(() => { const r = document.querySelector('#s-dm-inbox .dm-row') || document.querySelector('#s-dm-inbox button'); r?.click() }); await sleep(1300)
await shoot('15-dm-thread')
await tab('Profile'); await shoot('16-profile')

console.log('Done →', OUT)
await browser.close()
