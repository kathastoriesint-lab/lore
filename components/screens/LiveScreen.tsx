'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import type { CharId, Choice, ChoicePost, Meters, CricketMeters, Reaction } from '@/lib/types'
import { getVisibleSituations } from '@/lib/ch-rules'
import { getCricketChars, getCricketSituations, getCricketEndingData, getCricketDMTrustStart, getCHChars } from '@/lib/content'
import { resolveCricketEnding } from '@/lib/cricket-rules'
import { captainTrust, trustGateThreshold, ruleFor, selectionWeek } from '@/lib/cricket-selection'
import { resolveGateOutcome, resolveSituationVariant, resolveVariantIndex, variantCtxFor } from '@/lib/variants'
import { getWeek, weekForSituationId, SEASON_WEEKS } from '@/lib/season'
import { getStats, clamp, resolveEnding, resolveTokens, fameToFollowers, chCharForGender, asCricket, crushId } from '@/lib/game'
import { sentimentDelta, computeBond } from '@/lib/relationships'
import { phaseFromTag } from '@/lib/dm-time'
import * as haptics from '@/lib/haptics'
import * as sound from '@/lib/sound'
import MeterHUD from '@/components/MeterHUD'
import GoalCard from '@/components/GoalCard'
import ChoiceSheet from '@/components/ChoiceSheet'
import ComposePost, { type ComposeCtx } from '@/components/ComposePost'

// A single on-screen item in the cinematic live-typing reader.
type CinItem = {
  kind: 'nar' | 'img' | 'msg'
  text?: string; big?: boolean
  src?: string; cap?: string; h?: number; pos?: string
  who?: string; avatar?: string; typed?: string; phase?: 'dots' | 'typing' | 'done'
}


// Stable per-situation display order for the two choices. Roughly half the
// situations render with the choices swapped, so the dominant ("team-first")
// option isn't always the top button — this kills tap-the-top-slot autopilot.
// The TRUE choice index is always what gets recorded (handleChoice uses it), so
// deltas / flags / story summary stay correct regardless of display order.
const choiceDisplayOrder = (sit: { id?: string; choices: unknown[] }): number[] => {
  const idx = sit.choices.map((_, i) => i)
  if (sit.choices.length !== 2 || !sit.id) return idx
  const seed = sit.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return seed % 2 === 1 ? [idx[1], idx[0]] : idx
}


const StatusBar = () => (
  <div className="statusbar">
    <span>9:41</span>
    <span className="sb-right">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="#fff"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M1 4.2a11 11 0 0 1 14 0"/><path d="M3.6 6.9a7 7 0 0 1 8.8 0"/><path d="M6.1 9.5a3 3 0 0 1 3.8 0"/></svg>
      <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="1" y="1" width="20" height="10" rx="2.6" stroke="#fff" strokeOpacity=".45"/><rect x="2.6" y="2.6" width="14.5" height="6.8" rx="1.3" fill="#fff"/><rect x="22.4" y="4" width="1.6" height="4" rx="1" fill="#fff" fillOpacity=".45"/></svg>
    </span>
  </div>
)

// Creator House v4: four endings on the 2×2 (followers × crush bond).
const FINALE_DATA = {
  won:       { arc: 'Ghar Bhi, Dil Bhi', sub: 'Number #1 pe pahunche — aur jo real tha, woh bhi aakhir tak saath raha. Perfect finale.', color: '#FF2D78' },
  feedQueen: { arc: 'Feed Ka Raja/Rani', sub: 'Har headline tumhara. Tum jeete — par akele. Numbers aaye, log gaye.', color: '#FFB020' },
  worthMore: { arc: 'Numbers Se Zyada', sub: 'Leaderboard #1 nahi bane — par jo lekar nikle, woh numbers se bada tha.', color: '#FF5C3A' },
  chewedUp:  { arc: 'Ghar Ne Chaba Diya', sub: 'Ghar ne use kiya, phir thook diya. Na numbers, na koi apna. Yahi hai game.', color: '#5e5e6e' },
}

const asArray = <T,>(value: T | T[] | null | undefined): T[] => {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

// Inline char colors — must match .c-{id}{--cc} in globals.css (DESIGN.md compliant).
// Module-scope so both the Creator-House inline result and the cricket sheet reuse it.
const CHAR_COLORS: Record<string, string> = {
  ria:'#c41060', kabir:'#8a1840', dev:'#7a1535', ananya:'#b03060', zoya:'#a02858',
  meher:'#952050', rishi:'#6a1030', adi:'#b54070',
  hardik:'#003087', rohit:'#1a3a6e', surya:'#004080', bumrah:'#0a1a4a',
  tilak:'#2a5a8f', coach:'#3a2a5a', friend:'#1a4a6a', player:'#FF2D78',
}

// Plausible like counts for the Live "world reacts" post (mirrors the Feed's
// fabricated counts so the card reads like a real Instagram post).
const LIVE_LIKES = [94102, 128441, 76220, 183004, 52018, 211908]

// Story-pause nudges: a senior's trust is the relationship spine of the season. We
// pause at the STORY BEAT where that senior is judging the player, then send them
// into the DM with a seed that references the scene — so "build trust" becomes a
// concrete conversation, not a meter grind. Anchored to specific situations (the
// stage BEFORE the gate, where that senior's trust is the visible goal):
//   CR2-S4 (Hardik Ka Sawaal, W1) → Hardik, before the debut-XI selection
//   CR2-S8 (Toofan, W2)           → Rohit, the storm needs a mentor
//   CR2-S12 (Do Naam, W3)         → Hardik, before the eliminator XI
const TRUST_NUDGE_ANCHORS: Record<string, CharId> = {
  'CR2-S4': 'hardik',
  'CR2-S8': 'rohit',
  'CR2-S12': 'hardik',
}
const TRUST_NUDGES: Partial<Record<CharId, {
  title: string
  body: (cur: number, need: number) => string
  seed: string
}>> = {
  hardik: {
    title: 'Captain ka bharosa jeeto',
    body: (cur, need) => `Press mein India ka sawaal aaya, aur Hardik ne tujhe gaur se dekha. India squad mein jagah captain ke haath hai — uska bharosa abhi ${cur}/${need} hai, ${need} chahiye. Usse DM pe baat karo; chat mein woh batayega ki kya dekhna chahta hai.`,
    seed: 'Aaj press mein dekha tujhe. India ka sawaal sun ke thoda freeze ho gaya tha. ||| Main captain hoon — mujhe yakeen chahiye tu uss pressure ke liye ready hai. ||| Bata: jab pura stadium tujhse runs maange, tu apna game simple kaise rakhega?',
  },
  rohit: {
    title: 'Rohit ka bharosa jeeto',
    body: (cur, need) => `Review room mein Rohit ne teri batting gaur se dekhi. Away leg se pehle uska bharosa chahiye — abhi ${cur}/${need} hai, ${need} tak le jaana hai. Usse DM pe baat karo; woh jaanna chahta hai tu pressure mein kaise sochta hai.`,
    seed: 'Review room mein teri batting dekhi. Runs hain — par main learning dekhna chahta hoon. ||| Away leg aa raha hai, wahan crowd against hoti hai. ||| Bata: jab kuch na chal raha ho, tu innings kaise banata hai?',
  },
}



export default function LiveScreen() {
  const { navigate, game, screen, makeChoice, advanceSituation, injectCharDM, openDMThread, dmTrust, dmBadgeCount, startGame, upsertAiPost, setPendingPostReveal, notifyDM , skipWeekWait , startDmStorySession, dmNotif } = useApp()
  // Tracks when we're mid-choice-flow so the situation-change effect doesn't clear showPost
  const inFlowRef = useRef(false)

  const isCricket = game.world === 'cricket'

  // (Removed the first-visit coach-mark tour — it overlaid the opening cinematic
  // beat with vague tab tooltips ("World ki reactions") and read as noise. Both
  // worlds now open clean; onboarding, if reintroduced, must not cover scene one.)
  const allChars = isCricket ? { ...getCHChars(), ...getCricketChars() } : getCHChars()
  // 'player' is the cricket sentinel — the user plays as themselves, not an NPC.
  // char is null in cricket; use a synthetic player object only where post-card needs it.
  const char = game.char && game.char !== 'player' ? allChars[game.char] : null
  const playerChar = isCricket ? {
    id: 'player' as CharId, cls: '', init: (game.playerName?.[0] ?? 'N').toUpperCase(),
    name: game.playerName || 'Player', handle: (game.playerName || 'player').toLowerCase(),
    fame: 0, role: '',
  } : null

  // Shorthand: resolve tokens using current player state
  const r = (text: string) => resolveTokens(text, game.playerName, game.playerGender)

  // Build situation lookup map from the active world's list
  const allSituations = isCricket
    ? Object.fromEntries(getCricketSituations().map(s => [s.id, s]))
    : Object.fromEntries(getVisibleSituations(game.meters, game.choices).map(s => [s.id, s]))

  // Resolve current and adjacent situations by ID from the queue. Cricket beats
  // resolve their VARIANT here (selection verdict / trust band / flags / gate
  // results) — the single source LiveScreen, makeChoice, and replay agree on.
  const situation = game.situation
  const queue = game.situationQueue
  const rawSit = queue[situation] ? allSituations[queue[situation]] ?? null : null
  // Variants resolve in BOTH worlds now. Cricket keys on week verdict/trust/gates;
  // Creator House keys on flags (e.g. savedAlly → who got evicted). A beat with no
  // variants resolves to itself, so this is a no-op for every un-varianted beat.
  const variantCtx = rawSit ? variantCtxFor(game, dmTrust, isCricket ? weekForSituationId(rawSit.id) : undefined) : null
  const sit = rawSit && variantCtx ? resolveSituationVariant(rawSit, variantCtx) : rawSit
  // Which variant resolved (−1 = base). The reveal machine must re-arm when this
  // changes: a selection verdict landing mid-beat (SEL ceremony) swaps the beat's
  // reader without changing its id — a stale id-keyed effect kept showing the
  // base scene with the variant's choices.
  const variantKey = rawSit && variantCtx ? resolveVariantIndex(rawSit, variantCtx) : -1
  const isFinale = situation >= queue.length

  // Day-lock disabled for user testing (restore check for prod)
  const prevSit = situation > 0 && queue[situation - 1] ? allSituations[queue[situation - 1]] ?? null : null
  const isDayLocked = false

  // Countdown timer for locked day
  const [countdown, setCountdown] = useState('')
  const [, forceUpdate] = useState(0)  // triggers re-render when timer expires
  useEffect(() => {
    if (!isDayLocked || !sit) return
    const update = () => {
      const ms = game.dayUnlockTime[sit.day] - Date.now()
      if (ms <= 0) {
        setCountdown('00:00:00')
        forceUpdate(n => n + 1)  // re-render so isDayLocked re-evaluates to false
        return
      }
      const h = Math.floor(ms / 3_600_000)
      const m = Math.floor((ms % 3_600_000) / 60_000)
      const s = Math.floor((ms % 60_000) / 1_000)
      setCountdown(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    update()
    const t = setInterval(update, 1_000)
    return () => clearInterval(t)
  }, [isDayLocked, sit, game.dayUnlockTime])

  // Choice state
  const [chosen, setChosen] = useState<0 | 1 | null>(null)
  // Beat-entry gate (cricket): a beat NEVER starts by itself. After a choice the
  // engine advances, but the reader holds behind this cinematic title card until
  // the player taps in — the story can't play in the background (founder, Jul 4).
  const [introGate, setIntroGate] = useState(true)
  // Cinematic live-typing reveal — messages arrive (typing dots → typewriter), narration
  // is tap-paced. Mirrors the "Cinematic Live Typing" design-handoff state machine.
  const [revealed, setRevealed] = useState<CinItem[]>([])
  const [readerBusy, setReaderBusy] = useState(false)
  const [readerShowTap, setReaderShowTap] = useState(false)
  const [readerComplete, setReaderComplete] = useState(false)
  const [readerFinalHint, setReaderFinalHint] = useState(false)
  const readerCtlRef = useRef<{ revealNext: () => void; finishTyping: () => void } | null>(null)
  // Cricket choice sheet: peek (question only) vs expanded (choices). Once a
  // choice is made it auto-expands to the result. Cricket-only — CH keeps its bar.
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showImpact, setShowImpact] = useState(false)
  const [showPost, setShowPost] = useState(false)
  const [stats, setStats] = useState<{ total: number; pctA: number } | null>(null)
  // Chapter beat — brief full-screen card between situations
  const [outcomeFlash, setOutcomeFlash] = useState<{ title: string; note: string; passed: boolean } | null>(null)
  // DM notification banner — shows after injectCharDM fires
  // Story-pause trust nudge — shows once per stage when a senior's trust gates progress
  const [trustNudge, setTrustNudge] = useState<{ charId: CharId; cur: number; need: number } | null>(null)
  // Creator House "make a post": when a choice publishes a player post, the compose
  // sheet opens here (AI caption → Post → stream on the feed) instead of the inline preview.
  const [compose, setCompose] = useState<{
    key: string
    initialCaption: string
    imageUrl?: string
    why: { eyebrow: string; line: string; sub: string }
    ctx: ComposeCtx
    defaultReactions: Reaction[]
    dms: { char: CharId; text: string }[]
    followerDelta: number
  } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  // Ref-based processing guard — synchronously prevents double-tap between React renders
  const processingRef = useRef(false)
  // Timer cleanup refs to prevent post-unmount fires
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  // Snapshot of the situation at choice-time — keeps displayed content pinned to the
  // situation the player chose in even after advanceSituation() increments game.situation.
  const sitSnapshotRef = useRef<NonNullable<typeof sit> | null>(null)
  const displaySit = (chosen !== null && sitSnapshotRef.current) ? sitSnapshotRef.current : sit
  // Chat-story reveal state — reader[] blocks stream in one tap at a time; the choice
  // sheet stays hidden until every line is revealed. Prose situations have no reader → done.
  const readerBlocks = displaySit?.reader ?? null
  const readerDone = !readerBlocks || readerComplete

  // The cinematic reveal state machine. Re-arms whenever the situation changes (and
  // resets if the player un-chooses). Messages auto-arrive and type themselves; a tap
  // fast-forwards the in-progress line or advances narration. Mirrors the handoff exactly.
  useEffect(() => {
    const blocks = displaySit?.reader
    if (!blocks || chosen !== null) return
    if (introGate) return  // beat waits behind the cinematic title card (both worlds)
    setRevealed([]); setReaderBusy(false); setReaderShowTap(false); setReaderComplete(false); setReaderFinalHint(false)

    const resolve = (t?: string) => resolveTokens(t ?? '', game.playerName, game.playerGender)
    // Swap the cue avatar to the gender-correct creator (crush/ally flip for female players),
    // so the face matches the resolved {crush}/{ally} name.
    const swapAv = (av?: string) => {
      const m = av?.match(/\/avatars\/(\w+)\.png/)
      return m ? `/avatars/${chCharForGender(m[1], game.playerGender)}.png` : av
    }
    const mapped = blocks.map(blk => blk.t === 'cue'
      ? { t: 'msg' as const, who: resolve(blk.who), av: swapAv(blk.avatar), text: resolve(blk.text) }
      : blk.t === 'img'
        ? { t: 'img' as const, src: blk.src, cap: blk.text ? resolve(blk.text) : '', h: blk.h, pos: blk.pos }
        : { t: 'nar' as const, text: resolve(blk.text), big: blk.big })

    // 2-3 CLICKS PER BEAT (founder rule): the scene reveals in CHUNKS, not
    // block-by-block. Consecutive narration (+free imgs) lands together, max 2
    // nar lines per tap; each character message stands alone (dots → typewriter).
    // The trailing big stake line does NOT render here — it headlines the
    // full-screen choice splash instead.
    const hasStake = !!mapped[mapped.length - 1]?.big
    const body = hasStake ? mapped.slice(0, -1) : mapped
    type StreamItem = typeof mapped[number]
    const chunks: StreamItem[][] = []
    {
      let cur: StreamItem[] = []; let nars = 0
      for (const it of body) {
        if (it.t === 'msg') {
          if (cur.length) { chunks.push(cur); cur = []; nars = 0 }
          chunks.push([it])
        } else {
          cur.push(it)
          if (it.t === 'nar' && ++nars >= 2) { chunks.push(cur); cur = []; nars = 0 }
        }
      }
      if (cur.length) chunks.push(cur)
    }

    let idx = -1
    const rev: CinItem[] = []
    let tw: ReturnType<typeof setInterval> | null = null
    let dwell: ReturnType<typeof setTimeout> | null = null
    let init: ReturnType<typeof setTimeout> | null = null
    const scroll = () => { const el = scrollRef.current; if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight }) }
    const commit = () => setRevealed([...rev])
    const setLast = (patch: Partial<CinItem>) => { rev[rev.length - 1] = { ...rev[rev.length - 1], ...patch }; commit() }

    const afterSettle = () => {
      // The choice must be ASKED FOR — the splash arrives on the player's tap,
      // never mid-read (founder: 'choices come very abruptly').
      if (idx >= chunks.length - 1) setReaderFinalHint(true)
      setReaderShowTap(true); scroll()
    }
    const typeLast = (full: string) => {
      if (tw) clearInterval(tw)
      const t0 = performance.now(); const cps = 38
      tw = setInterval(() => {
        const n = Math.min(full.length, Math.floor((performance.now() - t0) / 1000 * cps) + 1)
        setLast({ typed: full.slice(0, n) }); scroll()
        if (n >= full.length) { if (tw) clearInterval(tw); tw = null; setLast({ phase: 'done' }); setReaderBusy(false); afterSettle() }
      }, 28)
    }
    const finishTyping = () => {
      if (tw) { clearInterval(tw); tw = null }
      if (dwell) { clearTimeout(dwell); dwell = null }
      const chunk = chunks[idx]
      const msg = chunk?.find(x => x.t === 'msg')
      const last = rev[rev.length - 1]
      if (last && last.phase !== 'done' && msg) setLast({ typed: msg.text, phase: 'done' })
      setReaderBusy(false); scroll(); afterSettle()
    }
    function revealNext() {
      setReaderShowTap(false)
      idx++
      if (idx >= chunks.length) { setReaderComplete(true); scroll(); return }
      const chunk = chunks[idx]
      let sawMsg = false
      for (const it of chunk) {
        if (it.t === 'msg') {
          sawMsg = true
          rev.push({ kind: 'msg', who: it.who, avatar: it.av, typed: '', phase: 'dots', text: it.text })
          commit(); setReaderBusy(true); scroll()
          dwell = setTimeout(() => { setLast({ phase: 'typing' }); scroll(); typeLast(it.text) }, 700 + Math.min(600, it.text.length * 8))
        } else if (it.t === 'img') {
          rev.push({ kind: 'img', src: it.src, cap: it.cap, h: it.h, pos: it.pos })
          commit()
        } else {
          rev.push({ kind: 'nar', text: it.text, big: it.big })
          commit()
        }
      }
      if (!sawMsg) { setReaderBusy(false); scroll(); afterSettle() }
    }

    readerCtlRef.current = { revealNext, finishTyping }
    init = setTimeout(revealNext, 550)
    return () => { if (tw) clearInterval(tw); if (dwell) clearTimeout(dwell); if (init) clearTimeout(init) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displaySit?.id, variantKey, isCricket, chosen, introGate, game.playerName, game.playerGender])

  // Effective react — derived from displaySit so it stays pinned during post-choice flow
  const effectiveReact = displaySit ? displaySit.react : null

  // Reset choice state when situation changes (skip during mid-choice flow)
  useEffect(() => {
    if (inFlowRef.current) return  // advanceSituation fires during flow — don't reset UI
    setChosen(null)
    setIntroGate(true)
    setSheetOpen(false)
    setShowImpact(false)
    setShowPost(false)
    setStats(null)
    setRevealed([]); setReaderBusy(false); setReaderShowTap(false); setReaderComplete(false); setReaderFinalHint(false)
    processingRef.current = false
    timersRef.current = []
  }, [situation])

  // Season interlude: Live is locked behind the match calendar. Redirect to the
  // lock screen — but never mid-outcome (chosen !== null keeps the player on the
  // final beat's result until they move on themselves). Gated on screen === 'live'
  // because Slots keep all screens mounted.

  // Creator House: a pending eviction routes to the ceremony before the next beat.
  // Same guard as the cricket lock — never interrupt a mid-choice outcome.
  useEffect(() => {
    if (screen === 'live' && !isCricket && game.pendingEviction && chosen === null && !inFlowRef.current) {
      navigate('eviction', { replace: true })
    }
  }, [screen, isCricket, game.pendingEviction, chosen, navigate])

  // Cricket: a pending squad selection routes STRAIGHT to the announcement —
  // no gate screen, no case-building detour (founder call, Jul 4).
  useEffect(() => {
    if (screen === 'live' && isCricket && game.pendingSelection && chosen === null && !inFlowRef.current) {
      navigate('selection', { replace: true })
    }
  }, [screen, isCricket, game.pendingSelection, chosen, navigate])

  // Beat title card behaves like a LOADING SCREEN (founder): it holds for a
  // cinematic beat, then the story starts itself — no tap. CRITICAL: only auto-
  // advances while the player is ACTUALLY LOOKING at the Live screen. Otherwise
  // the timer would fire in the background (while they're on the feed/DM) and the
  // next beat would play behind them — the exact "story moves ahead on its own"
  // bug. Both worlds; never behind the break / ceremony / eviction.
  useEffect(() => {
    // NOT while an outcome overlay covers Live: the DM arrival sheet (dmNotif)
    // and the post-compose sheet both keep screen==='live', so without these the
    // card would "load" the next beat behind them.
    const cardUp = introGate && screen === 'live' && !dmNotif && !compose
      && !!sit && !isFinale && chosen === null
      && !game.pendingSelection && !game.pendingEviction && !isDayLocked
      && !((game.weekUnlockAt ?? 0) > Date.now())
    if (!cardUp) return
    const t = setTimeout(() => setIntroGate(false), 1650)
    return () => clearTimeout(t)
  }, [introGate, screen, dmNotif, compose, sit?.id, isFinale, chosen, game.pendingSelection, game.pendingEviction, isDayLocked, game.weekUnlockAt])

  // Clear pending timers on unmount to prevent post-unmount navigate/advanceSituation
  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout) }
  }, [])

  // Tap "Message {senior}" — seed the chat with what to talk about (once), then open it.
  const openTrustNudgeDM = useCallback((charId: CharId) => {
    const cfg = TRUST_NUDGES[charId]
    const seedKey = `lore_trust_seed_${charId}`
    let alreadySeeded = false
    try { alreadySeeded = !!localStorage.getItem(seedKey) } catch {}
    if (cfg && !alreadySeeded) {
      try { localStorage.setItem(seedKey, '1') } catch {}
      cfg.seed.split('|||').map(s => s.trim()).filter(Boolean).forEach((text, i) => {
        setTimeout(() => injectCharDM(charId, text), 200 + i * 500)
      })
    }
    setTrustNudge(null)
    openDMThread(charId)
  }, [injectCharDM, openDMThread])

  // Load stats for current situation
  useEffect(() => {
    if (sit) {
      getStats(situation).then(setStats).catch(() => setStats({ total: 4218, pctA: 62 }))
    }
  }, [situation, sit])

  const addTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }

  // Inner reset — called after beat (or directly by Go to Feed)
  const doReset = useCallback(() => {
    inFlowRef.current = false
    sitSnapshotRef.current = null
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setChosen(null)
    setIntroGate(true)
    setSheetOpen(false)
    setShowImpact(false)
    setShowPost(false)
    setOutcomeFlash(null)
    setRevealed([]); setReaderBusy(false); setReaderShowTap(false); setReaderComplete(false); setReaderFinalHint(false)
    processingRef.current = false
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Advance past a resolved beat: doReset arms the cinematic title card (introGate),
  // which is the single beat-entry screen for the NEXT beat. No separate chapter card.
  const resetAfterChoice = useCallback(() => { doReset() }, [doReset])

  const goToFeed = useCallback(() => {
    resetAfterChoice()
    navigate('feed', { fromStory: true })
  }, [resetAfterChoice, navigate])

  const handleChoice = useCallback(async (idx: 0 | 1) => {
    if (processingRef.current || !sit) return
    const preChoiceMeters = { ...game.meters }
    processingRef.current = true
    setChosen(idx)
    if (isCricket) setShowImpact(true) // Creator House cuts to the feed — no Live impact card

    try {
      // makeChoice updates meters+choices in React state only (no Supabase write yet)
      await makeChoice(idx)
    } catch {
      inFlowRef.current = false
      processingRef.current = false
      setChosen(null)
      setShowImpact(false)
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      return
    }

    const ch = sit.choices[idx]
    inFlowRef.current = true  // freeze situation-change effect during animation
    sitSnapshotRef.current = sit  // freeze displayed content to this situation
    const outcome = resolveGateOutcome(ch, preChoiceMeters, dmTrust, game.gateResults, sit?.id)?.outcome ?? null
    if (outcome) {
      const passed = outcome === ch.outcomeGate?.pass
      setOutcomeFlash({
        title: outcome.title ?? (passed ? 'YOU PLAYED WELL' : 'OUT EARLY'),
        note: outcome.note,
        passed,
      })
    }

    // Advance situation immediately so "Next Situation" can never race the timer.
    // sitSnapshotRef keeps the render pinned to the current situation's content.
    advanceSituation()

    addTimer(() => { scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }) }, 200)

    // If this choice publishes a player post, open the compose sheet (gpt-4o
    // caption → Post → stream on the feed) — the insta-post moment, both worlds.
    // Cricket legacy prose beats (no postWhy) keep their static result sheet.
    if (!isCricket || ch.postWhy) {
      const legacyPost: ChoicePost | null = ch.caption ? { source: 'player', caption: ch.caption, reactions: ch.reactions ?? [] } : null
      const composeSource = outcome?.post !== undefined ? outcome.post : (ch.post !== undefined ? ch.post : legacyPost)
      const playerSpec = asArray(composeSource).find(p => p && p.source === 'player' && !!p.caption)
      if (playerSpec) {
        const letter = idx === 0 ? 'A' : 'B'
        const fDelta = fameToFollowers(clamp(preChoiceMeters.fame + (ch.deltas.fame ?? 0))) - fameToFollowers(clamp(preChoiceMeters.fame))
        const audienceStr = fameToFollowers(clamp(preChoiceMeters.fame)).toLocaleString('en-IN')
        const whyLine = (ch.postWhy ? r(ch.postWhy) : 'Tumhara move, ab public. Pura ghar, aur tumhare {followers} followers, dekh rahe hain.').replace(/\{followers\}/g, audienceStr)
        setCompose({
          key: `${sit.id}-${letter}`,
          initialCaption: r(playerSpec.caption),
          imageUrl: playerSpec.imageUrl || sit.reader?.find(b => b.t === 'img')?.src,
          why: {
            eyebrow: `AB DUNIYA KO BATAO${ch.postTag ? ' · ' + r(ch.postTag) : ''}`,
            line: whyLine,
            sub: `Day ${sit.day} ka tone yahin set hoga`,
          },
          ctx: {
            playerName: game.playerName || 'you',
            day: sit.day,
            beatTitle: sit.title,
            sceneSummary: r(sit.title),
            choiceText: r(ch.t),
            world: game.world,
            characters: Object.values(isCricket ? getCricketChars() : getCHChars()).map(c => ({ id: c.id, name: c.name })),
          },
          defaultReactions: (playerSpec.reactions ?? []).map(rx => ({ ...rx, text: r(rx.text) })),
          dms: asArray(outcome?.dm !== undefined ? outcome.dm : ch.dm).map(d => ({ char: d.char, text: r(d.text) })),
          followerDelta: Math.max(0, fDelta),
        })
        return
      }
    }

    const dmSource = outcome?.dm !== undefined ? outcome.dm : ch.dm
    // Scripted choice DMs now fire for both worlds (only when the choice authors a dm —
    // 0 existing CH situations had one, so this is a targeted enable for Day 1+ content).
    const dmsToInject = asArray(dmSource)

    if (!isCricket) {
      // Creator House: no Live result screen. The choice's character post lands on the
      // feed. If you engaged a character (the choice's primary DM, e.g. "talk to
      // Ananya"), you're taken straight into their thread; other characters' reactions
      // arrive as app-wide notifications. A choice with no DM just cuts to the feed.
      // Swap kabir<->ananya for female players so a crush/ally DM lands in the right thread.
      const primary = dmsToInject[0] ? (chCharForGender(dmsToInject[0].char, game.playerGender) as CharId) : undefined
      // Narrative timing for the thread: tag each injected DM with the beat's
      // day + phase + title so the DM screen shows a "DAY N · PHASE" divider.
      const dmMeta = sit ? { day: sit.day, phase: phaseFromTag(sit.tag), note: r(sit.title) } : undefined
      dmsToInject.forEach((d, i) => {
        const cid = chCharForGender(d.char, game.playerGender) as CharId
        addTimer(() => {
          if (cid === primary) injectCharDM(cid, r(d.text), undefined, dmMeta)
          else notifyDM(cid, r(d.text), undefined, dmMeta)
        }, 150 + i * 220)
      })
      addTimer(() => { doReset(); if (primary) { startDmStorySession(primary); openDMThread(primary, { fromStory: true }) } else navigate('feed', { fromStory: true }) }, 520)
      return
    }

    // Cricket: ONE character DMs you per beat — never more (founder rule).
    // Delivery is the ARRIVAL SHEET (avatar, typing, "Reply to X"), not an
    // auto-navigation: the first bubble rides the sheet, the rest land quietly
    // in the thread behind it. Reply → scoped story chat; swipe down → read later.
    const primary = dmsToInject[0]?.char as CharId | undefined
    const primaryDms = primary ? dmsToInject.filter(dm => dm.char === primary) : []
    const dmMeta = sit ? { day: sit.day, phase: phaseFromTag(sit.tag), note: r(sit.title) } : undefined
    primaryDms.forEach((dm, i) => {
      addTimer(() => {
        if (i === 0) notifyDM(dm.char, r(dm.text), undefined, dmMeta, { story: true })
        else injectCharDM(dm.char, r(dm.text), undefined, dmMeta)
      }, 150 + i * 220)
    })
    const lastBeat = situation >= queue.length - 1
    addTimer(() => {
      doReset()
      if (lastBeat) return              // let the ending arc render on Live
      if (!primary) navigate('feed', { fromStory: true })    // post outcomes still land on the feed
    }, 520)
  }, [sit, situation, queue.length, game.meters, makeChoice, advanceSituation, navigate, injectCharDM, notifyDM, openDMThread, doReset, isCricket, dmTrust])


  // Navigate to tabs
  const handleTab = useCallback((tab: string) => {
    if (tab === 'home') navigate('feed')
    else if (tab === 'profile') navigate('profile')
    else if (tab === 'dms') navigate('dm-inbox')
  }, [navigate])

  // Finale arc — world-aware
  const endingKey = isFinale
    ? isCricket
      ? resolveCricketEnding(asCricket(game.meters).form, captainTrust(dmTrust), (game.benchedWeeks ?? []).length)
      : resolveEnding(game.meters.fame, computeBond(crushId(game.playerGender), 'creator-house', game.choices, game.playerName, game.playerGender, dmTrust).bond)
    : null
  const finaleArc = endingKey
    ? (isCricket ? getCricketEndingData()[endingKey] : FINALE_DATA[endingKey as keyof typeof FINALE_DATA])
    : null

  // game.char === null means no world started yet; 'player' is the cricket sentinel (user plays as themselves)
  if (!game.char) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
        <div style={{ fontSize: 16, color: 'var(--ink2)', textAlign: 'center' }}>Apna naam aur gender batao pehle</div>
        <button
          style={{ padding: '14px 28px', background: 'var(--accent)', color: '#fff', borderRadius: 14, fontWeight: 700, fontSize: 16 }}
          onClick={() => navigate('world-intro')}
        >
          Get started →
        </button>
      </div>
    )
  }

  // Next situation for chapter beat display

  // "The world reacts" IG post(s) for a chosen choice — used by the cricket
  // result sheet. (Creator House renders its own inline copy below, unchanged.)
  const postCards = (ch: Choice, before: Meters) => {
    const legacyPost: ChoicePost | null = ch.caption
      ? { source: 'player', caption: ch.caption, reactions: ch.reactions ?? [] }
      : null
    const outcome = resolveGateOutcome(ch, before, dmTrust, game.gateResults, displaySit?.id)?.outcome ?? null
    const postSource = outcome?.post !== undefined ? outcome.post : (ch.post !== undefined ? ch.post : legacyPost)
    const postSpecs = asArray(postSource).filter(post => post.display !== 'feed-only')
    const resolvePostOwner = (postSpec: ChoicePost) => {
      if (!postSpec) return null
      if (postSpec.source === 'account') {
        const handle = postSpec.handle ?? postSpec.name?.toLowerCase().replace(/\s+/g, '') ?? 'update'
        return { id: '__account', cls: '', init: postSpec.avatarText ?? (postSpec.name ?? handle)[0]?.toUpperCase() ?? 'U', name: postSpec.name ?? handle, handle, avatarUrl: undefined as string | undefined, color: '#003087' }
      }
      if (postSpec.source === 'character' && postSpec.char) {
        const c = allChars[postSpec.char]
        if (!c) return null
        return { id: c.id, cls: c.cls, init: c.init, name: c.name, handle: c.handle, avatarUrl: `/avatars/${c.id}.png`, color: CHAR_COLORS[c.id] ?? '#1a1a2e' }
      }
      if (!playerChar) return null
      return { id: playerChar.id, cls: playerChar.cls, init: playerChar.init, name: playerChar.name, handle: postSpec.handle ?? (game.playerName || playerChar.handle || 'you').toLowerCase().replace(/\s+/g, ''), avatarUrl: game.avatarUrl, color: CHAR_COLORS[playerChar.id] ?? '#1a1a2e' }
    }
    return postSpecs.map((postSpec, postIndex) => {
      const postOwner = resolvePostOwner(postSpec)
      if (!postOwner) return null
      const hasRealPost = !!postSpec.caption && !postSpec.caption.startsWith('*(')
      const postReactions = postSpec.reactions ?? []
      const postBg = postSpec.imageUrl
        ? `linear-gradient(to bottom, rgba(0,0,0,.04) 0%, rgba(0,0,0,.12) 52%, rgba(0,0,0,.62) 100%), url(${postSpec.imageUrl}) center/cover`
        : `linear-gradient(150deg, ${postOwner.color} 0%, #022058 60%, #0a0a18 100%)`
      const likes = LIVE_LIKES[(situation + postIndex) % LIVE_LIKES.length].toLocaleString('en-IN')
      return (
        <div key={`${displaySit!.id}-${chosen}-${postIndex}`} style={{ marginTop: 16, background: '#0f0f18', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)', animation: 'slideUp .45s cubic-bezier(.32,.72,0,1) both' }}>
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px' }}>
            <div className={postOwner.cls ? `av ${postOwner.cls}` : 'av'} style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0, background: postOwner.avatarUrl ? 'transparent' : postOwner.color, backgroundImage: postOwner.avatarUrl ? `url(${postOwner.avatarUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {!postOwner.avatarUrl && postOwner.init}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{postOwner.handle}</div>
              <div style={{ fontSize: 10, color: 'var(--ink3)' }}>{postSpec.label ?? 'abhi · MI Season 1'}</div>
            </div>
            {hasRealPost && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'rgba(255,45,120,.12)', padding: '3px 8px', borderRadius: 20 }}>NEW</div>}
          </div>
          {hasRealPost ? (
            <>
              {/* image — edge-to-edge, IG portrait crop */}
              <div style={{ position: 'relative', aspectRatio: '4 / 5', background: postBg }}>
                {!postSpec.imageUrl && (
                  <p style={{ position: 'absolute', left: 0, right: 0, bottom: 0, margin: 0, padding: '40px 16px 18px', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, lineHeight: 1.45, color: '#fff', background: 'linear-gradient(to top, rgba(0,0,0,.6), transparent)', textShadow: '0 1px 6px rgba(0,0,0,.5)' }}>{r(postSpec.caption)}</p>
                )}
              </div>
              {/* IG action row (decorative — the real likes/comments live on Feed) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 14px 4px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </div>
              {/* likes */}
              <div style={{ fontWeight: 700, fontSize: 14, padding: '0 14px', color: '#fff' }}>{likes} likes</div>
              {/* caption — prominent (IG hierarchy) */}
              <div style={{ fontSize: 14, lineHeight: 1.5, padding: '5px 14px 2px', color: 'var(--ink)' }}>
                <b>{postOwner.handle}</b> {r(postSpec.caption)}
              </div>
              {/* comments — smaller + muted */}
              {postReactions.length > 0 && (
                <div style={{ padding: '2px 14px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {postReactions.map((rx, j) => {
                    const isFan = rx.char === '__fan'
                    const rxChar = isFan ? null : allChars[rx.char as CharId]
                    return (
                      <div key={j} style={{ fontSize: 12, lineHeight: 1.45, color: 'rgba(255,255,255,.6)' }}>
                        <b style={{ color: 'rgba(255,255,255,.88)', fontWeight: 600 }}>{isFan || !rxChar ? (rx.name ?? 'fan') : (rxChar.handle ?? rxChar.name)}</b> {r(rx.text)}
                      </div>
                    )
                  })}
                </div>
              )}
              {/* timestamp */}
              <div style={{ fontSize: 11, color: 'var(--ink3)', padding: '6px 14px 12px', letterSpacing: '.04em' }}>JUST NOW</div>
            </>
          ) : (
            <div style={{ margin: '0 14px 14px', padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink3)', lineHeight: 1.5 }}>
                {r(postSpec.caption).replace(/<\/?em>/g, '').replace(/^\(|\)$/g, '')}
              </div>
            </div>
          )}
        </div>
      )
    })
  }

  // Compact impact card for the cricket result sheet: FORM + FAME, plus a
  // CAPTAIN row whenever the choice moved Hardik's trust (the second goal).
  const cricketImpactCard = (d: Partial<{ form: number; fame: number; trust: number }>, hardikDelta = 0) => {
    const m = asCricket(game.meters)
    const dForm = d.form ?? 0, dFame = d.fame ?? 0
    const before = { form: Math.max(0, m.form - dForm), fame: Math.max(0, m.fame - dFame) }
    const cap = captainTrust(dmTrust)
    const rows = [
      { icon: '🏏', label: 'FORM', color: '#FFB020', delta: dForm, to: m.form, from: before.form },
      { icon: '⭐', label: 'FAME', color: '#FF5C3A', delta: dFame, to: m.fame, from: before.fame },
      ...(hardikDelta !== 0 ? [{ icon: '🧢', label: "CAPTAIN'S TRUST", color: '#3DD6C8', delta: hardikDelta, to: cap, from: Math.max(0, cap - hardikDelta) }] : []),
    ]
    return (
      <div style={{ marginTop: 14, background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
        {rows.map((m, idx) => (
          <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderTop: idx === 0 ? 'none' : '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 26, lineHeight: 1, color: m.color, width: 40, textAlign: 'center', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{m.delta > 0 ? '+' : ''}{m.delta}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.06em', color: m.color, whiteSpace: 'nowrap' }}>{m.icon} {m.label}</span>
                <span style={{ fontSize: 11, color: 'var(--ink3)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', paddingLeft: 8 }}>{m.from} → {m.to}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, m.to))}%`, borderRadius: 3, background: m.color, transition: 'width .6s cubic-bezier(.32,.72,0,1)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <StatusBar />

      {/* Story-pause trust nudge — sends the player into a senior's DM */}
      {trustNudge && TRUST_NUDGES[trustNudge.charId] && (() => {
        const cfg = TRUST_NUDGES[trustNudge.charId]!
        const ch = allChars[trustNudge.charId]
        const first = ch?.name?.split(' ')[0] ?? trustNudge.charId
        return (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 65, background: 'linear-gradient(180deg,#0a0f1e 0%,#020308 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '32px 28px', textAlign: 'center', animation: 'fadeIn .2s ease both',
          }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.16em', color: 'var(--trust)', marginBottom: 18 }}>RUKO</div>
            {ch && (
              <div className={`av ${ch.cls}`} style={{
                width: 72, height: 72, fontSize: 26, marginBottom: 16,
                backgroundImage: `url(/avatars/${trustNudge.charId}.png)`, backgroundSize: 'cover', backgroundPosition: 'center',
              }}><span style={{ opacity: 0 }}>{ch.init}</span></div>
            )}
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 30, lineHeight: 1.05, color: '#fff', maxWidth: 320 }}>
              {cfg.title}
            </div>
            <div style={{ marginTop: 16, maxWidth: 330, fontSize: 14.5, lineHeight: 1.5, color: 'rgba(255,255,255,.74)' }}>
              {cfg.body(trustNudge.cur, trustNudge.need)}
            </div>
            <button
              onClick={() => openTrustNudgeDM(trustNudge.charId)}
              style={{
                marginTop: 28, width: 'min(310px,100%)', minHeight: 56, borderRadius: 16,
                background: 'var(--trust)', color: '#031615', border: 'none',
                fontSize: 16, fontWeight: 900, fontFamily: 'var(--sans)', cursor: 'pointer',
                boxShadow: '0 14px 38px rgba(61,214,200,.22)',
              }}
            >
              {first} ko message karo →
            </button>
            <button
              onClick={() => setTrustNudge(null)}
              style={{
                marginTop: 12, width: 'min(310px,100%)', minHeight: 48, borderRadius: 16,
                background: 'transparent', color: 'var(--ink3)', border: '1px solid var(--line)',
                fontSize: 14, fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer',
              }}
            >
              Abhi nahi
            </button>
          </div>
        )
      })()}

      {/* (Old "SITUATION N of M" chapter card removed — the single cinematic
          title card below is the one beat-entry screen, both worlds.) */}

      {/* Match outcome flash — used for gated cricket beats like debut result */}
      {outcomeFlash && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 60,
          background: outcomeFlash.passed
            ? 'radial-gradient(circle at 50% 32%, rgba(61,214,200,.28), transparent 32%), linear-gradient(180deg,#061a18 0%,#020308 100%)'
            : 'radial-gradient(circle at 50% 32%, rgba(255,92,58,.30), transparent 32%), linear-gradient(180deg,#1c0806 0%,#020308 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 26, textAlign: 'center',
          animation: 'fadeIn .18s ease both',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '.18em',
            color: outcomeFlash.passed ? '#3DD6C8' : '#FF5C3A',
            marginBottom: 12,
          }}>MATCH RESULT</div>
          <div style={{
            fontFamily: 'var(--serif)', fontWeight: 700, lineHeight: .92,
            fontSize: 54, color: '#fff', maxWidth: 330,
            textShadow: outcomeFlash.passed ? '0 0 34px rgba(61,214,200,.32)' : '0 0 34px rgba(255,92,58,.32)',
          }}>{outcomeFlash.title}</div>
          <div style={{
            marginTop: 18, maxWidth: 330, fontSize: 15, lineHeight: 1.45,
            color: 'rgba(255,255,255,.74)',
          }}>{r(outcomeFlash.note)}</div>
          <div style={{
            marginTop: 24, height: 4, width: 150, borderRadius: 999,
            background: 'rgba(255,255,255,.12)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: '100%',
              background: outcomeFlash.passed ? '#3DD6C8' : '#FF5C3A',
              animation: 'meterFlash 1.8s ease both',
            }} />
          </div>
          <button
            onClick={() => setOutcomeFlash(null)}
            style={{
              marginTop: 34,
              width: 'min(310px, 100%)',
              minHeight: 58,
              borderRadius: 18,
              background: outcomeFlash.passed ? '#3DD6C8' : '#FF5C3A',
              color: outcomeFlash.passed ? '#031615' : '#fff',
              border: 'none',
              fontSize: 17,
              fontWeight: 900,
              fontFamily: 'var(--sans)',
              cursor: 'pointer',
              boxShadow: outcomeFlash.passed ? '0 14px 38px rgba(61,214,200,.22)' : '0 14px 38px rgba(255,92,58,.22)',
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* HUD. On cricket Live you optimize for the focused goal — show the goal card
          (big). Creator House Live shows no status header: the FAME/HEAT/TRUST +
          eviction read lives on Feed, keeping the story screen clean. */}
      {isCricket && <GoalCard variant="focus" />}

      {/* Selection gate — the free-flow squad moment. The next beat waits behind
          the team sheet; the player can detour to build their case first. */}
      {/* THE FAISLA SPLASH — the choice gets its own full-screen moment
          (founder call): eyebrow, the stake line, the question in serif,
          then the two cards. Weight comes from isolation, not decoration. */}
      {displaySit && displaySit.reader && readerDone && chosen === null && (() => {
        const tagClean = (displaySit.tag ?? '').replace(/^[^A-Za-z0-9]*/, '').trim()
        return (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 45, background: 'var(--bg)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '32px 24px', animation: 'evVoteIn .45s cubic-bezier(.32,.72,0,1) both',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 320, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 130% 60% at 50% -10%, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 70%)',
            }} />
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.16em', color: 'var(--accent)', position: 'relative' }}>
              FAISLA · {tagClean}
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 31, lineHeight: 1.15, color: '#fff', margin: '16px 0 24px', position: 'relative' }}>
              {r(displaySit.q)}
            </div>
            <div className="cin-choices" style={{ display: 'flex', flexDirection: 'column', gap: 11, position: 'relative' }}>
              {choiceDisplayOrder(displaySit).map((trueIdx, i) => {
                const c = displaySit!.choices[trueIdx]
                return (
                  <button key={trueIdx} className="cin-ch" onClick={() => handleChoice(trueIdx as 0 | 1)}>
                    <span style={{
                      width: 34, height: 34, borderRadius: '50%', border: '1.5px solid var(--line)',
                      display: 'grid', placeItems: 'center', flexShrink: 0, marginRight: 12,
                      fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 15, color: 'var(--ink2)',
                    }}>{String.fromCharCode(65 + i)}</span>
                    <div className="cin-ch-main">
                      <div className="cin-cht">{r(c.t)}</div>
                      <div className="cin-chs">{r(c.s)}</div>
                    </div>
                    <span className="cin-chgo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg></span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* BEAT TITLE CARD — every beat opens on this cinematic gate (week, beat
          number, title). The reader starts on YOUR tap, never by itself. Sits
          UNDER the break/system overlays (z45 < z50). */}
      {introGate && sit && !isFinale && chosen === null && !game.pendingSelection && !game.pendingEviction && !isDayLocked && (() => {
        const eyebrow = isCricket ? `WEEK ${weekForSituationId(sit.id)}` : `DAY ${sit.day}`
        const glow = isCricket ? 'rgba(0,48,135,.22)' : 'rgba(255,45,120,.16)'
        return (
          <div
            style={{ position: 'absolute', inset: 0, zIndex: 45, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 34px', textAlign: 'center', animation: 'loFade .4s ease both' }}>
            <div style={{ position: 'absolute', top: '16%', left: '50%', transform: 'translateX(-50%)', width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(ellipse, ${glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div className="cin-si" style={{ alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.24em', color: 'var(--accent)' }}>{eyebrow}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 82, fontWeight: 700, lineHeight: 1.05, color: '#fff', margin: '6px 0 0' }}>{situation + 1}</div>
              <div style={{ fontSize: 15, color: 'var(--ink3)' }}>of {queue.length}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 27, fontWeight: 600, color: 'var(--ink2)', lineHeight: 1.3, marginTop: 12 }}>{r(sit.title)}</div>
              {sit.tag && <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink3)', marginTop: 9 }}>{r(sit.tag)}</div>}
            </div>
            {/* loading-screen affordance — no tap, the beat starts itself */}
            <div style={{ position: 'absolute', bottom: 96, left: 0, right: 0, display: 'flex', gap: 7, justifyContent: 'center' }}>
              <span className="cin-td" /><span className="cin-td d2" /><span className="cin-td d3" />
            </div>
          </div>
        )
      })()}

      {/* WEEK BREAK — the story pauses ~6h; the pause routes you to PEOPLE:
          two DM doors, exactly (founder) — captain ka bharosa, senior ke tips.
          Both done → the wait skips. */}
      {isCricket && !game.pendingSelection && (game.weekUnlockAt ?? 0) > Date.now() && chosen === null && !inFlowRef.current && (() => {
        const il = game.interlude
        const chatted = il?.charsChatted ?? []
        // game.week already points at the UPCOMING week here (set at selection).
        const wk = Math.min(Math.max(game.week ?? 1, 1), 3)
        const capGapNow = Math.max(0, ruleFor(wk).start.captain - captainTrust(dmTrust))
        // Tips senior = whoever pays off in the NEXT match: Bumrah before the
        // debut (his advice lowers the S7 knock gate), Rohit before the
        // eliminator week (his trust unlocks the 6AM mentorship).
        const advisor = (wk <= 2 ? 'bumrah' : 'rohit') as CharId
        const advisorName = getCricketChars()[advisor]?.name?.split(' ')[0] ?? 'Senior'
        const hardikDone = chatted.includes('hardik')
        const tipsDone = chatted.filter(c => c !== 'hardik').length >= 1
        const allDone = hardikDone && tipsDone
        const unlockAt = new Date(game.weekUnlockAt!)
        const hh = unlockAt.getHours() % 12 || 12
        const mm = unlockAt.getMinutes().toString().padStart(2, '0')
        const card = (icon: string, name: string, sub: string, hint: string, done: boolean, go: () => void) => (
          <button onClick={go} style={{
            display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left',
            background: 'var(--surf)', border: `1px solid ${done ? 'color-mix(in srgb, var(--trust) 40%, transparent)' : 'var(--line)'}`,
            borderRadius: 16, padding: '15px 16px', cursor: 'pointer', marginBottom: 10,
          }}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>{icon}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800, color: '#fff' }}>{name}</span>
              <span style={{ display: 'block', fontSize: 11.5, color: 'var(--ink3)', marginTop: 2 }}>{sub}</span>
            </span>
            {done
              ? <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--trust)', flexShrink: 0 }}>DONE ✓</span>
              : <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.04em', color: 'var(--accent)', flexShrink: 0 }}>{hint} →</span>}
          </button>
        )
        return (
          <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'var(--bg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
            <div style={{ position: 'absolute', top: '12%', left: '50%', transform: 'translateX(-50%)', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,48,135,.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', color: '#5B8DEF', textAlign: 'center' }}>WEEK {Math.max(wk - 1, 1)} KHATAM · BREAK</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 27, fontWeight: 600, lineHeight: 1.35, textAlign: 'center', margin: '14px 0 6px' }}>
              Agla match {hh}:{mm} baje.
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink3)', textAlign: 'center', marginBottom: 22 }}>
              Tab tak dressing room khula hai — 2 log tumhara wait kar rahe hain.
            </div>
            {card('🧢', 'Hardik Pandya',
              capGapNow > 0 ? `Captain ka bharosa — abhi ${capGapNow} kam` : 'Captain ka bharosa pakka rakho',
              'TRUST', hardikDone, () => openDMThread('hardik'))}
            {card('💡', advisorName,
              `Agle match ke liye tips — ${advisorName} se seedhi baat`,
              'TIPS', tipsDone, () => openDMThread(advisor))}
            {allDone && (
              <button onClick={() => { skipWeekWait(); }} style={{ width: '100%', marginTop: 6, padding: '15px 0', borderRadius: 16, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: 'var(--sans)', cursor: 'pointer', boxShadow: '0 8px 28px rgba(255,45,120,.35)' }}>
                Dono ho gaya — agla match ABHI khelo →
              </button>
            )}
          </div>
        )
      })()}

      {/* Day-lock overlay — sits above scroll, MeterHUD, sticky buttons, and tab bar */}
      {isDayLocked && sit && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'var(--bg)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '32px 28px',
        }}>
          {/* Subtle glow */}
          <div style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: 260, height: 260, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,45,120,.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Day complete badge */}
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '.12em',
            color: 'var(--accent)', marginBottom: 16, opacity: 0.8,
            animation: 'fadeIn .4s ease both',
          }}>
            {isCricket ? 'SEASON 1 · IPL' : 'CREATOR HOUSE'}
          </div>

          {/* Large day number */}
          <div style={{
            fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 72, lineHeight: 1,
            color: '#fff', marginBottom: 6,
            animation: 'fadeIn .4s ease .1s both', opacity: 0,
          }}>
            Day {sit.day - 1}
          </div>
          <div style={{
            fontSize: 16, color: 'var(--ink2)', marginBottom: 8,
            animation: 'fadeIn .4s ease .15s both', opacity: 0,
          }}>
            complete
          </div>

          {/* Divider */}
          <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,.12)', margin: '20px 0',
            animation: 'fadeIn .4s ease .2s both', opacity: 0 }} />

          {/* Next day teaser */}
          <div style={{
            fontSize: 13, color: 'var(--ink3)', marginBottom: 8, textAlign: 'center',
            animation: 'fadeIn .4s ease .25s both', opacity: 0,
          }}>
            Day {sit.day} unlocks in
          </div>

          {/* Countdown */}
          <div style={{
            fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 48, lineHeight: 1,
            color: 'var(--ink)', letterSpacing: '.02em', fontVariantNumeric: 'tabular-nums',
            marginBottom: 32,
            animation: 'fadeIn .4s ease .3s both', opacity: 0,
          }}>
            {countdown}
          </div>

          {/* CTA buttons */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 12, width: '100%',
            animation: 'fadeIn .4s ease .4s both', opacity: 0,
          }}>
            <button
              onClick={() => navigate('feed')}
              style={{
                width: '100%', height: 54, background: 'var(--accent)', color: '#fff',
                fontWeight: 700, fontSize: 15, borderRadius: 14, border: 'none',
                cursor: 'pointer', fontFamily: 'var(--sans)',
                boxShadow: '0 8px 24px rgba(255,45,120,.35)',
              }}
            >
              Go to Feed →
            </button>
            {isCricket && (
              <button
                onClick={() => navigate('dm-inbox')}
                style={{
                  width: '100%', height: 50, background: 'rgba(255,255,255,.07)', color: 'var(--ink2)',
                  fontWeight: 600, fontSize: 14, borderRadius: 14,
                  border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', fontFamily: 'var(--sans)',
                }}
              >
                Go to Messages →
              </button>
            )}
          </div>

          {/* Small note */}
          <div style={{
            marginTop: 24, fontSize: 12, color: 'var(--ink3)', textAlign: 'center',
            animation: 'fadeIn .4s ease .5s both', opacity: 0,
          }}>
            Come back when the timer ends — the next scene is waiting.
          </div>
        </div>
      )}

      {/* Main scroll */}
      <div className="live-scroll" ref={scrollRef}
        onClick={() => {
          if (!displaySit?.reader || chosen !== null || readerComplete) return
          // Story tap → light haptic. Also warm the audio context under this
          // gesture so a later timer-fired DM cue can play.
          if (readerBusy) { haptics.tap(); sound.prime(); readerCtlRef.current?.finishTyping() }
          else if (readerShowTap) { haptics.tap(); sound.prime(); readerCtlRef.current?.revealNext() }
        }}
        style={displaySit?.reader && chosen === null && !readerComplete ? { cursor: 'pointer' } : undefined}
      >

        {/* Creator House — Season 1 finale (Day 10 done): reveal the ending the
            player earned (fame-led → Main Character, heat-led → The Heart). */}
        {isFinale && !isCricket && (
          <div style={{ padding: '36px 24px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: '64%', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', color: 'var(--accent)' }}>CREATOR HOUSE · SEASON 1 FINALE</div>
            <div style={{ fontSize: 14.5, color: 'var(--ink2)', lineHeight: 1.5 }}>10 din. Ek ghar. Aur ant mein — duniya ne tumhe yeh maana:</div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 38, lineHeight: 1.08, color: finaleArc?.color ?? '#FFB020' }}>{finaleArc?.arc ?? 'The Main Character'}</div>
            <div style={{ fontSize: 15, color: 'var(--ink2)', lineHeight: 1.55 }}>{finaleArc?.sub ?? ''}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11.5, color: 'var(--ink3)', marginTop: 2 }}>
              <span style={{ background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 99, padding: '5px 11px' }}>{game.choices.length} faisle</span>
              <span style={{ background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 99, padding: '5px 11px' }}>{fameToFollowers(game.meters.fame).toLocaleString('en-IN')} followers</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18, width: '100%' }}>
              <button className="lo-press" style={{ width: '100%', height: 54, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)' }} onClick={() => navigate('feed')}>Feed dekho →</button>
              <button className="lo-press" style={{ width: '100%', height: 48, background: 'none', color: 'var(--ink2)', fontWeight: 600, fontSize: 14, borderRadius: 14, border: '1px solid var(--line)', cursor: 'pointer', fontFamily: 'var(--sans)' }} onClick={() => navigate('profile')}>Profile</button>
            </div>
          </div>
        )}

        {/* Finale screen — cricket season arc only */}
        {isFinale && isCricket && finaleArc && (
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20, minHeight: '60%', justifyContent: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>{isCricket ? 'INDIAN DRESSING ROOM — SEASON FINALE' : 'CREATOR HOUSE — FINALE'}</div>
            <div style={{
              fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 36, lineHeight: 1.1,
              color: finaleArc.color
            }}>
              {finaleArc.arc}
            </div>
            <div style={{ fontSize: 15, color: 'var(--ink2)', lineHeight: 1.55 }}>{finaleArc.sub}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <div style={{ padding: '10px 16px', background: `color-mix(in srgb, ${finaleArc.color} 20%, transparent)`, border: `1px solid color-mix(in srgb, ${finaleArc.color} 40%, transparent)`, borderRadius: 12, fontSize: 12, fontWeight: 700, color: finaleArc.color }}>
                🏏 Form {asCricket(game.meters).form}
              </div>
              <div style={{ padding: '10px 16px', background: 'color-mix(in srgb, #FF5C3A 20%, transparent)', border: '1px solid color-mix(in srgb, #FF5C3A 40%, transparent)', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#FF5C3A' }}>
                ⭐ Fame {asCricket(game.meters).fame}
              </div>
              <div style={{ padding: '10px 16px', background: 'color-mix(in srgb, #3DD6C8 20%, transparent)', border: '1px solid color-mix(in srgb, #3DD6C8 40%, transparent)', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#3DD6C8' }}>
                🧢 Captain&apos;s Trust {captainTrust(dmTrust)}
              </div>
            </div>

            {/* Season 2 hook — no ending dead-ends */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: 'var(--fame)', display: 'block', marginBottom: 6 }}>SEASON 2</span>
              {({
                indiaCall: 'India ki jersey mili hai — ab use RAKHNA padta hai. Pehla international season aa raha hai.',
                captainsBet: 'Captain ne daav lagaya tha. Season 2 mein woh daav vasool hoga — ya doob jayega.',
                statsMachine: 'Numbers ne bulaya, kamre ne nahi. Season 2: thande kamre ko garam karna hai.',
                notYet: "Benched hua ladka Ranji se wapas aata hai. Season 2 wahi kahani hai — tumhari.",
              } as Record<string, string>)[endingKey ?? 'notYet']}
            </div>


            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <button
                className="lo-press"
                style={{ width: '100%', height: 54, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)' }}
                onClick={() => navigate('profile')}
              >
                View Profile →
              </button>
              {!isCricket ? (
                <button
                  className="lo-press"
                  style={{ width: '100%', height: 48, background: 'transparent', color: 'var(--ink2)', fontWeight: 600, fontSize: 14, borderRadius: 14, border: '1px solid var(--line)', cursor: 'pointer', fontFamily: 'var(--sans)' }}
                  onClick={startGame}
                >
                  Dobara khelo ↺
                </button>
              ) : (
                <button
                  className="lo-press"
                  style={{ width: '100%', height: 48, background: 'transparent', color: 'var(--ink3)', fontWeight: 500, fontSize: 14, borderRadius: 14, border: '1px solid var(--line)', cursor: 'pointer', fontFamily: 'var(--sans)' }}
                  onClick={() => navigate('feed')}
                >
                  View Feed →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Situation — use displaySit (snapshot) so the content stays pinned
             to the situation the player chose in, even after advanceSituation() fires */}
        {displaySit && (
          <div className="situation">
            <div className="sit-tag">{displaySit.tag}</div>
            <div className="sit-title">{r(displaySit.title)}</div>
            <div className="sit-body">
              {displaySit.reader ? (
                <div className="cin-stream">
                  {revealed.map((it, i) => (
                    <div className="cin-si" key={i}>
                      {it.kind === 'nar' && <p className={`cin-nar${it.big ? ' big' : ''}`}>{it.text}</p>}
                      {it.kind === 'img' && (
                        // Scene photos are portrait (1122×1402) — a short cover window
                        // centered vertically decapitates them. Render taller and bias
                        // the crop toward the top band where faces live.
                        <div className="cin-img" style={{ height: Math.max(it.h ?? 172, 280), backgroundImage: it.src ? `url(${it.src})` : undefined, backgroundPosition: it.pos ?? 'center 18%' }}>
                          {it.cap ? <span className="cin-imgcap">{it.cap}</span> : null}
                        </div>
                      )}
                      {it.kind === 'msg' && (
                        <div className="cin-row">
                          <div className="cin-av" style={{ backgroundImage: it.avatar ? `url(${it.avatar})` : undefined }} />
                          <div className="cin-bub">
                            <div className="cin-name">{it.who}</div>
                            {it.phase === 'dots'
                              ? <div className="cin-btxt dots"><span className="cin-td" /><span className="cin-td d2" /><span className="cin-td d3" /></div>
                              : <div className="cin-btxt">{it.typed}{it.phase === 'typing' && <span className="cin-caret" />}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {readerShowTap && (
                    <div className="cin-taphint" style={readerFinalHint ? { color: 'var(--accent)', fontWeight: 800 } : undefined}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                      {readerFinalHint ? 'Faisle ka waqt — tap karo' : 'Tap anywhere to continue'}
                    </div>
                  )}
                </div>
              ) : (
                displaySit.body.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: r(p) }} />
                ))
              )}
            </div>

            {/* Character reaction */}
            {!readerBlocks && effectiveReact && (() => {
              // Swap kabir↔ananya for female players: kabir=ally for male, ananya=crush for male — roles flip
              const reactCharId: CharId = game.playerGender === 'female'
                ? effectiveReact.char === 'kabir' ? 'ananya'
                : effectiveReact.char === 'ananya' ? 'kabir'
                : effectiveReact.char
                : effectiveReact.char
              const reactChar = allChars[reactCharId]
              return (
                <div className="sit-react">
                  <div
                    className={`av ${reactChar.cls}`}
                    style={{ width:26, height:26, fontSize:11,
                      backgroundImage:`url(/avatars/${reactChar.id}.png)`,
                      backgroundSize:'cover', backgroundPosition:'center' }}
                  >
                    <span style={{ opacity:0 }}>{reactChar.init}</span>
                  </div>
                  <div className="react-body">
                    <div className="rn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {reactChar.name}
                      {/* T3: Bond delta chip — show after choice is made */}
                      {showImpact && (() => {
                        const delta = sentimentDelta(r(effectiveReact.text))
                        if (delta === 0) return null
                        const pos = delta > 0
                        return (
                          <span style={{
                            fontSize: 12, fontWeight: 700, letterSpacing: '.01em',
                            color: pos ? '#3DD6C8' : '#FF5C3A',
                            background: pos ? 'rgba(61,214,200,.12)' : 'rgba(255,92,58,.12)',
                            padding: '2px 8px', borderRadius: 6,
                          }}>
                            {pos ? '+' : ''}{delta} bond
                          </span>
                        )
                      })()}
                    </div>
                    <div className={`react-bubble ${reactChar.cls}`}>{r(effectiveReact.text)}</div>
                  </div>
                </div>
              )
            })()}

            {/* ── Post-choice: collapsible impact + player post + reactions ──
                 Creator House only — cricket renders its result inside the choice sheet. */}
            {!isCricket && showImpact && chosen !== null && displaySit!.choices[chosen] && (() => {
              const ch = displaySit!.choices[chosen]
              const d = ch.deltas
              const isCritical = false  // CH has no heat meter anymore
              // Before value — Creator House only tracks fame (shown as followers).
              const before = { fame: Math.max(0, game.meters.fame - (d.fame ?? 0)) }
              // Inline char color — must match .c-{id}{--cc} in globals.css (DESIGN.md compliant)
              const CHAR_COLORS: Record<string, string> = {
                ria:'#c41060', kabir:'#8a1840', dev:'#7a1535', ananya:'#b03060', zoya:'#a02858',
                meher:'#952050', rishi:'#6a1030', adi:'#b54070',
                hardik:'#003087', rohit:'#1a3a6e', surya:'#004080', bumrah:'#0a1a4a',
                tilak:'#2a5a8f', coach:'#3a2a5a', friend:'#1a4a6a', player:'#FF2D78',
              }
              const legacyPost: ChoicePost | null = ch.caption
                ? { source: 'player', caption: ch.caption, reactions: ch.reactions ?? [] }
                : null
              const outcome = resolveGateOutcome(ch, before, dmTrust, game.gateResults, displaySit?.id)?.outcome ?? null
              const postSource = outcome?.post !== undefined ? outcome.post : (ch.post !== undefined ? ch.post : legacyPost)
              const postSpecs = asArray(postSource)
                .filter(post => post.display !== 'feed-only')
              const resolvePostOwner = (postSpec: ChoicePost) => {
                if (!postSpec) return null
                if (postSpec.source === 'account') {
                  const handle = postSpec.handle ?? postSpec.name?.toLowerCase().replace(/\s+/g, '') ?? 'update'
                  return {
                    id: '__account',
                    cls: '',
                    init: postSpec.avatarText ?? (postSpec.name ?? handle)[0]?.toUpperCase() ?? 'U',
                    name: postSpec.name ?? handle,
                    handle,
                    avatarUrl: undefined as string | undefined,
                    color: '#003087',
                  }
                }
                if (postSpec.source === 'character' && postSpec.char) {
                  const c = allChars[postSpec.char]
                  if (!c) return null
                  return {
                    id: c.id,
                    cls: c.cls,
                    init: c.init,
                    name: c.name,
                    handle: c.handle,
                    avatarUrl: `/avatars/${c.id}.png`,
                    color: CHAR_COLORS[c.id] ?? '#1a1a2e',
                  }
                }
                const playerOwner = isCricket
                  ? playerChar
                  : (char
                      ? (game.playerGender === 'female'
                          ? char.id === 'kabir' ? allChars['ananya'] : char.id === 'ananya' ? allChars['kabir'] : char
                          : char)
                      : null)
                if (!playerOwner) return null
                return {
                  id: playerOwner.id,
                  cls: playerOwner.cls,
                  init: playerOwner.init,
                  name: playerOwner.name,
                  handle: postSpec.handle ?? (game.playerName || playerOwner.handle || 'you').toLowerCase().replace(/\s+/g, ''),
                  avatarUrl: isCricket ? game.avatarUrl : `/avatars/${playerOwner.id}.png`,
                  color: CHAR_COLORS[playerOwner.id] ?? '#1a1a2e',
                }
              }

              // Compact delta summary for collapsed state (CH: followers/fame only)
              const dF = d.fame ?? 0
              const deltaSummary = dF !== 0 ? `${dF > 0 ? '+' : ''}${dF}⭐` : ''

              return (
                <div style={{ marginTop: 16 }}>

                  {/* Followers change — Creator House shows the one number that matters. No meters. */}
                  {(() => {
                    const afterF = fameToFollowers(game.meters.fame)
                    const delta = afterF - fameToFollowers(before.fame)
                    if (delta === 0) return null
                    return (
                      <div className="impact-card" style={{ marginTop: 0, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.1em', color: 'var(--ink3)' }}>FOLLOWERS</div>
                          <div style={{ fontSize: 23, fontWeight: 800, color: '#fff', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{afterF.toLocaleString()}</div>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: delta >= 0 ? 'var(--fame)' : 'var(--heat)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {delta >= 0 ? '▲' : '▼'} {delta >= 0 ? '+' : ''}{delta.toLocaleString()}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Player post + reactions — shown after post is ready */}
                  {/* Caption starting with "*(" is a meta-note (no public post was made) */}
                  {showPost && postSpecs.map((postSpec, postIndex) => {
                    const postOwner = resolvePostOwner(postSpec)
                    if (!postOwner) return null
                    const hasRealPost = !!postSpec.caption && !postSpec.caption.startsWith('*(')
                    const postReactions = postSpec.reactions ?? []
                    const postBg = postSpec.imageUrl
                      ? `linear-gradient(to bottom, rgba(0,0,0,.04) 0%, rgba(0,0,0,.12) 52%, rgba(0,0,0,.62) 100%), url(${postSpec.imageUrl}) center/cover`
                      : `linear-gradient(to bottom, ${postOwner.color}bb 0%, ${postOwner.color}66 55%, #0a0a18 100%)`
                    return (
                      <div key={`${displaySit!.id}-${chosen}-${postIndex}`} style={{ marginTop: 12, background: '#0f0f18', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)', animation: 'slideUp .4s cubic-bezier(.32,.72,0,1) both' }}>
                        {/* Post header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                          <div
                            className={postOwner.cls ? `av ${postOwner.cls}` : 'av'}
                            style={{
                              width: 32, height: 32, fontSize: 12, flexShrink: 0,
                              background: postOwner.avatarUrl ? 'transparent' : postOwner.color,
                              backgroundImage: postOwner.avatarUrl ? `url(${postOwner.avatarUrl})` : undefined,
                              backgroundSize: 'cover', backgroundPosition: 'center',
                            }}
                          >
                            {!postOwner.avatarUrl && postOwner.init}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>@{postOwner.handle}</div>
                            <div style={{ fontSize: 10, color: 'var(--ink3)' }}>{postSpec.label ?? `just now · ${isCricket ? 'MI Season 1' : 'Creator House'}`}</div>
                          </div>
                          {hasRealPost
                            ? <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'rgba(255,45,120,.12)', padding: '3px 8px', borderRadius: 20 }}>✓ POSTED</div>
                            : <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink3)', background: 'rgba(255,255,255,.06)', padding: '3px 8px', borderRadius: 20 }}>offline</div>
                          }
                        </div>

                        {hasRealPost ? (
                          <>
                            <div style={{ margin: '0 12px', borderRadius: 10, background: postBg, aspectRatio: '4/3', position: 'relative', overflow: 'hidden' }}>
                              {!postSpec.imageUrl && (
                                <p style={{
                                  position: 'absolute', bottom: 0, left: 0, right: 0, margin: 0,
                                  padding: '32px 14px 14px',
                                  fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14,
                                  color: 'rgba(255,255,255,.95)', lineHeight: 1.45,
                                  background: 'linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 100%)',
                                  textShadow: '0 1px 6px rgba(0,0,0,.5)',
                                }}>{r(postSpec.caption)}</p>
                              )}
                            </div>
                            <div style={{ padding: '10px 14px 0', fontSize: 13, lineHeight: 1.45, color: 'rgba(255,255,255,.9)' }}>
                              <b>@{postOwner.handle}</b> {r(postSpec.caption)}
                            </div>
                          </>
                        ) : (
                          /* No post made — quiet offline note */
                          <div style={{ margin: '0 12px 12px', padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink3)', lineHeight: 1.5 }}>
                              {r(postSpec.caption).replace(/<\/?em>/g, '').replace(/^\(|\)$/g, '')}
                            </div>
                          </div>
                        )}

                        {/* Reactions as threaded comments */}
                        {postReactions.length > 0 && (
                          <div style={{ padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {postReactions.map((rx, j) => {
                              const isFan = rx.char === '__fan'
                              const rxChar = isFan ? null : (
                                game.playerGender === 'female'
                                  ? rx.char === 'kabir' ? allChars['ananya'] : rx.char === 'ananya' ? allChars['kabir'] : allChars[rx.char as CharId]
                                  : allChars[rx.char as CharId]
                              )
                              return (
                                <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                                  {isFan || !rxChar ? (
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1e1e2a', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 800, color: 'var(--ink3)', flexShrink: 0, border: '1px solid rgba(255,255,255,.06)' }}>
                                      {(rx.name ?? 'fan')[0].toUpperCase()}
                                    </div>
                                  ) : (
                                    <div className={`av ${rxChar.cls}`} style={{ width: 24, height: 24, fontSize: 9, flexShrink: 0, backgroundImage: `url(/avatars/${rxChar.id}.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                      <span style={{ opacity: 0 }}>{rxChar.init}</span>
                                    </div>
                                  )}
                                  <div style={{ fontSize: 12, lineHeight: 1.45, color: 'rgba(255,255,255,.88)' }}>
                                    <span style={{ fontWeight: 700, marginRight: 5 }}>
                                      {isFan || !rxChar ? `@${rx.name ?? 'fan'}` : rxChar.name}
                                    </span>
                                    {isFan && (
                                      <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--ink3)', background: 'rgba(255,255,255,.07)', padding: '1px 5px', borderRadius: 4, marginRight: 5 }}>FAN</span>
                                    )}
                                    {r(rx.text)}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        )}

        {/* Bottom spacing so content isn't hidden under sticky bar */}
        {displaySit && <div style={{ height: 160 }} />}
      </div>

      {/* Creator House choice / result — shared <ChoiceSheet> shell (parity with cricket):
           peek button → frosted choice cards → Next / Feed. The impact card + posts render
           inline in the scroll above (CH keeps its richer impact detail there). */}
      {/* Chat-story: the whole screen is tappable to advance — show a quiet hint, not a button */}
      {displaySit && !isCricket && !readerDone && !displaySit.reader && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--tabbar) + 16px)', zIndex: 10, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--ink3)', fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 500, opacity: .65 }}>
          Tap anywhere to continue
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      )}
      {/* For chat-story (reader) situations the choices render inline as bubbles above;
          the sheet only handles the result/Next here. Prose situations keep the full sheet. */}
      {displaySit && !isCricket && readerDone && (chosen !== null || !displaySit.reader) && (() => {
        const isResult = chosen !== null
        const seenChoices = typeof window !== 'undefined' ? parseInt(localStorage.getItem('lore_feed_seen_choices') || '0', 10) : 0
        const newPosts = Math.max(0, game.choices.length - seenChoices)
        return (
          <ChoiceSheet
            question={r(displaySit.q)}
            choices={choiceDisplayOrder(displaySit).map(trueIdx => ({ trueIdx, t: r(displaySit.choices[trueIdx].t), s: r(displaySit.choices[trueIdx].s) }))}
            sheetOpen={sheetOpen}
            onOpen={() => setSheetOpen(true)}
            onChoose={(i) => handleChoice(i)}
            social={stats}
            isResult={isResult}
          >
            {showPost ? (
              <div style={{ display: 'flex', gap: 10, padding: '2px 16px 18px' }}>
                <button className="lo-press" onClick={resetAfterChoice} style={{ flex: 2, height: 56, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, color: '#fff', background: 'var(--accent)', boxShadow: '0 8px 24px rgba(255,45,120,.35)' }}>{isFinale ? 'Continue →' : 'Next →'}</button>
                <button className="lo-press" onClick={goToFeed} style={{ flex: 1, height: 56, border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, cursor: 'pointer', fontFamily: 'var(--sans)', background: 'rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Feed</span>
                  {newPosts > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>{newPosts} new</span>}
                </button>
              </div>
            ) : (
              <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="pulse" style={{ width: 8, height: 8 }} /></div>
            )}
          </ChoiceSheet>
        )
      })()}

      {/* Cricket: ONLY legacy non-reader (prose) beats use the ChoiceSheet shell.
           Reader beats (all CR2 content) render choices inline and route straight
           to the feed / DM after a choice — no result-receipt sheet. */}
      {displaySit && isCricket && !displaySit.reader && (() => {
        const isResult = chosen !== null
        const ch = isResult ? displaySit.choices[chosen as 0 | 1] : null
        // "N new" on the Feed button = posts played since the Feed was last opened.
        const seenChoices = typeof window !== 'undefined' ? parseInt(localStorage.getItem('lore_feed_seen_choices') || '0', 10) : 0
        const newPosts = Math.max(0, game.choices.length - seenChoices)
        return (
          <ChoiceSheet
            question={r(displaySit.q)}
            choices={choiceDisplayOrder(displaySit).map(trueIdx => ({ trueIdx, t: r(displaySit.choices[trueIdx].t), s: r(displaySit.choices[trueIdx].s) }))}
            sheetOpen={sheetOpen}
            onOpen={() => setSheetOpen(true)}
            onChoose={(i) => handleChoice(i)}
            social={stats}
            isResult={isResult}
          >
            {ch && (
              <div style={{ padding: '2px 16px 18px' }}>
                {cricketImpactCard(ch.deltas, ch.relationshipDeltas?.hardik ?? 0)}
                {showPost && (() => { const m = asCricket(game.meters); return postCards(ch, { form: Math.max(0, m.form - (ch.deltas.form ?? 0)), fame: Math.max(0, m.fame - (ch.deltas.fame ?? 0)) }) })()}
                {showPost ? (
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button className="lo-press" onClick={resetAfterChoice} style={{ flex: 2, height: 56, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, color: '#fff', background: 'var(--accent)', boxShadow: '0 8px 24px rgba(255,45,120,.35)' }}>{isFinale ? 'Continue →' : 'Next →'}</button>
                    <button className="lo-press" onClick={() => navigate('feed')} style={{ flex: 1, height: 56, border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, cursor: 'pointer', fontFamily: 'var(--sans)', background: 'rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Feed</span>
                      {newPosts > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>{newPosts} new</span>}
                    </button>
                  </div>
                ) : (
                  <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="pulse" style={{ width: 8, height: 8 }} /></div>
                )}
              </div>
            )}
          </ChoiceSheet>
        )
      })()}

      {/* Creator House "make a post" — composer (Screen A) → live feed reaction (Screen B) */}
      {compose && (
        <ComposePost
          playerName={game.playerName}
          avatarUrl={game.avatarUrl}
          imageUrl={compose.imageUrl}
          ctx={compose.ctx}
          fallbackCaption={compose.initialCaption}
          why={compose.why}
          onShare={async (caption, preReactions) => {
            const c = compose
            const followersNow = fameToFollowers(game.meters.fame)
            const likesTarget = Math.round(followersNow * 0.22) + 4000
            // Reactions are usually pre-fetched in the composer → instant Share. If not
            // ready yet, fetch now (authored fallback on failure).
            let reactions: Reaction[] = (preReactions && preReactions.length) ? (preReactions as Reaction[]) : c.defaultReactions
            if (!preReactions || !preReactions.length) {
              try {
                const res = await fetch('/api/lore-post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'reactions', caption, ctx: c.ctx }) })
                if (res.ok) { const d = await res.json(); if (Array.isArray(d.reactions) && d.reactions.length) reactions = d.reactions }
              } catch { /* keep authored fallback */ }
            }
            upsertAiPost(c.key, { caption, reactions, likes: likesTarget, followerDelta: c.followerDelta, dms: c.dms, imageUrl: c.imageUrl, revealed: false })
            // Land directly on the real feed; the reaction animates there (in the
            // current feed UI) via the pendingPostReveal sequence.
            setCompose(null)
            setPendingPostReveal(c.key)
            doReset()
            navigate('feed', { fromStory: true })
          }}
          onBack={() => {
            const c = compose
            setCompose(null)
            // Back out → fall back to the normal inline result (DMs + authored post).
            c.dms.forEach((d, i) => addTimer(() => { notifyDM(d.char, d.text) }, 300 + i * 450))
            addTimer(() => setShowPost(true), 300)
          }}
        />
      )}


      {/* Tab bar */}
      <div className="tabbar">
        <button className="tab" onClick={() => handleTab('home')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>
          <span>Feed</span>
        </button>
        <button className="tab" onClick={() => handleTab('dms')} style={{ position: 'relative' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {dmBadgeCount > 0 && <div className="badge-num" style={{ top:0, right:8 }}>{dmBadgeCount > 9 ? '9+' : dmBadgeCount}</div>}
          <span>Messages</span>
        </button>
        <button className="tab" onClick={() => handleTab('profile')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <span>Profile</span>
        </button>
      </div>


    </div>
  )
}
