'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { AiPost, CharId, DMMessage, GameState, Reaction, Screen, Situation } from '@/lib/types'
import { AppContext, ImpactNotif, RelationshipAlert } from '@/lib/context'
import {
  applyDeltas, applyFlagDeltas, charMeters, ensureSession, getAIReply, scoreTrustDelta,
  loadAllDMs, loadDMs, loadGameState, recordChoice, resetGameState, saveDM, saveGameState,
  fameToFollowers, DEFAULT_FLAGS, buildCricketQueue, buildCHQueue, asCricket, chCharForGender,
} from '@/lib/game'
import { getVisibleSituations } from '@/lib/ch-rules'
import { stampTime, phaseFromTag, type DMTimeMeta } from '@/lib/dm-time'
import { getCricketChars, getCricketDMTrustStart, getCricketSituations, initContent, getCHChars, getCHSituations, getCHDMMock, getCHDMHooks, getCHDMOrder, getCHDMTrust } from '@/lib/content'
import WorldsScreen from '@/components/screens/WorldsScreen'
import WorldIntroScreen from '@/components/screens/WorldIntroScreen'
import FeedScreen from '@/components/screens/FeedScreen'
import NarratorScreen from '@/components/screens/NarratorScreen'
import LoadingScreen from '@/components/LoadingScreen'
import LiveScreen from '@/components/screens/LiveScreen'
import DMInboxScreen from '@/components/screens/DMInboxScreen'
import DMThreadScreen from '@/components/screens/DMThreadScreen'
import ProfileScreen from '@/components/screens/ProfileScreen'
import GlobalProfileScreen from '@/components/screens/GlobalProfileScreen'
import CharProfileScreen from '@/components/screens/CharProfileScreen'
import OnboardingScreen from '@/components/screens/OnboardingScreen'
import LoginScreen from '@/components/screens/LoginScreen'
import CricketIntroScreen from '@/components/screens/CricketIntroScreen'
import CricketCarouselScreen from '@/components/screens/CricketCarouselScreen'
import SelectionScreen from '@/components/screens/SelectionScreen'
import EvictionScreen from '@/components/screens/EvictionScreen'
import FeedbackButton from '@/components/FeedbackButton'
import DMArrivalSheet from '@/components/DMArrivalSheet'
import ErrorBoundary from '@/components/ErrorBoundary'
import { analytics, getDeviceId } from '@/lib/analytics'
import { isWeekEnd, weekForSituationId, FRESH_INTERLUDE, SEASON_WEEKS, DM_DAILY_BUDGET, INTERLUDE_CAPS } from '@/lib/season'
import { SELECTION_TRIGGERS, resolveSelectionVerdict, isRecall, captainTrust, selectionWeek } from '@/lib/cricket-selection'
import { resolveVariantIndex, applyVariant, variantCtxFor, resolveGateOutcome } from '@/lib/variants'
import { EVICTION_TRIGGERS, buildEviction } from '@/lib/creator-house'
import { recordWorldEntered, bumpChoices, touchDayStreak } from '@/lib/profile-stats'
import { scheduleMatchDayNotification, cancelMatchDayNotification } from '@/lib/native-notify'

const clampTrust = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

const trustBandFor = (trust: number): 'low' | 'normal' | 'high' => {
  if (trust < 30) return 'low'
  if (trust < 60) return 'normal'
  return 'high'
}

const trustGuidanceFor = (trust: number) => {
  const band = trustBandFor(trust)
  const teamLine = ''
  if (band === 'low') {
    return `Trust band: LOW (<30). This overrides the character's usual warmth, nicknames, emoji habits, and teaching style. Output shape: under 22 words, one blunt line plus one terse question/challenge. No lists, tactical field/bowler details, multi-step advice, detailed coaching, private history, personal warmth, emojis, or "I noticed" language. If asked for advice, give only a surface-level instruction and imply they must earn deeper mentorship.${teamLine}`
  }
  if (band === 'high') {
    return `Trust band: HIGH (60+). Output shape: 3-5 sentences. Make it feel earned and personal. If story context exists, reference one specific past choice or pattern. Give the real advice you would hold back at low trust. You may show warmth, concern, teasing, or investment in your own character voice. End with a sharper follow-up question. Do not offer future preference unlocks yet.${teamLine}`
  }
  return `Trust band: NORMAL (30-60). Output shape: 2-3 sentences. Be professional and useful, but not intimate. Give one practical piece of advice. Avoid private history unless it is directly relevant. Avoid deep emotional warmth or vulnerability. End with one practical follow-up question.${teamLine}`
}

const defaultDmTrustFor = (world: GameState['world'], charId: CharId) => (
  world === 'cricket' ? (getCricketDMTrustStart()[charId] ?? 50) : (getCHDMTrust()[charId] ?? 50)
)

// No canned opener DMs: the dressing room does NOT introduce itself. The
// player DMs a senior first, and the character's FIRST AI reply carries the
// welcome beat (founder call, Jul 3) — earned access, not broadcast.

const asArray = <T,>(value: T | T[] | null | undefined): T[] => {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('worlds')
  const [navHistory, setNavHistory] = useState<Screen[]>(['worlds'])
  const [dmChar, setDmChar] = useState<CharId | null>(null)
  // Story-chat session: set when a CHOICE routes into a DM. Scopes that visit
  // to a few replies, then hands the player back to the feed. Visiting threads
  // on your own is unscoped (daily budget applies instead).
  const [dmStorySession, setDmStorySession] = useState<{ char: CharId; sent: number } | null>(null)
  const startDmStorySession = useCallback((char: CharId) => setDmStorySession({ char, sent: 0 }), [])
  const [dmTrust, setDmTrust] = useState<Record<string, number>>({})
  const [relationshipAlerts, setRelationshipAlerts] = useState<RelationshipAlert[]>([])
  const [impactNotif, setImpactNotif] = useState<ImpactNotif | null>(null)
  // Live "make a post" (gpt-4o) — the freshly-posted key to stream on the feed,
  // the app-wide DM notification banner, and the transient follower receipt.
  const [pendingPostReveal, setPendingPostReveal] = useState<string | null>(null)
  const [dmNotif, setDmNotif] = useState<{ id: string; name: string; cls: string; text: string; story?: boolean } | null>(null)
  const [followerReceipt, setFollowerReceipt] = useState<{ delta: number } | null>(null)
  const [hudReaction, setHudReaction] = useState<{ base: number; gain: number; key: string } | null>(null)

  const showImpact = useCallback((n: ImpactNotif) => {
    setImpactNotif(n)
    setTimeout(() => setImpactNotif(null), 4000)
  }, [])
  // Per-character fame (drives follower counts on all profiles)
  const [charFame, setCharFame] = useState<Record<string, number>>({
    ria:85, kabir:55, dev:30, ananya:15, zoya:50
  })
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [postComments, setPostComments] = useState<Record<string, string>>({})
  const [dmBadgeCount, setDmBadgeCount] = useState(0)
  const clearDmBadge = useCallback(() => setDmBadgeCount(0), [])
  const [viewingCharId, setViewingCharId] = useState<CharId | null>(null)
  const [game, setGame] = useState<GameState>({
    playerName: '', playerGender: 'male' as const,
    world: 'creator-house' as const, char: null,
    situation: 0, situationQueue: [], choices: [],
    meters: { fame: 20 },
    flags: DEFAULT_FLAGS, runMemory: {},
    narrator_done: false, dayUnlockTime: {},
  })
  const [dmHistory, setDmHistory] = useState<Record<string, DMMessage[]>>({})
  const [dmLastUpdated, setDmLastUpdated] = useState<Record<string, number>>({})
  // Tracks which chars have had their full DB history loaded — prevents the bug where
  // injectCharDM populates dmHistory[charId] before openDMThread runs, so the guard
  // `!dmHistory[charId]` skips the DB load and old messages are never shown.
  const dmDbLoadedRef = useRef<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Live refs mirroring relationship/social state so any save captures the latest
  // values without stale closures. These get persisted into game_state.game_data.
  const gameRef = useRef(game); gameRef.current = game
  // Session-route analytics (see navigate / load effect)
  const sessionOrdinalRef = useRef(0)
  const firstNavTrackedRef = useRef(false)
  const dmTrustRef = useRef(dmTrust); dmTrustRef.current = dmTrust
  const charFameRef = useRef(charFame); charFameRef.current = charFame
  const likedPostsRef = useRef(likedPosts); likedPostsRef.current = likedPosts
  const postCommentsRef = useRef(postComments); postCommentsRef.current = postComments
  const dmHistoryRef = useRef(dmHistory); dmHistoryRef.current = dmHistory
  // Snapshot of all progress-extras to merge into every game_state write
  const extrasSnapshot = useCallback(() => ({
    dmTrust: dmTrustRef.current,
    charFame: charFameRef.current,
    likedPosts: [...likedPostsRef.current],
    postComments: postCommentsRef.current,
  }), [])

  // Hydrate all persisted progress after login/reload — game + relationships + likes
  const hydrateProgress = useCallback((s: GameState) => {
    setGame(s)
    if (s.dmTrust && Object.keys(s.dmTrust).length) setDmTrust(s.dmTrust)
    if (s.charFame && Object.keys(s.charFame).length) setCharFame(prev => ({ ...prev, ...s.charFame }))
    if (s.likedPosts && s.likedPosts.length) setLikedPosts(new Set(s.likedPosts))
    if (s.postComments && Object.keys(s.postComments).length) setPostComments(s.postComments)
  }, [])

  useEffect(() => {
    initContent().catch(() => {}) // background content refresh; bundled content renders meanwhile
    touchDayStreak() // cross-world day-streak for the global profile
    if (typeof window !== 'undefined' && new URLSearchParams(location.search).has('reset')) {
      resetGameState().finally(() => {
        window.history.replaceState(null, '', location.pathname)
        navigate('worlds', { replace: true })
        setReady(true)
      })
      return
    }
    // The app has no service worker. Older builds may have registered one that
    // now serves stale cache forever. Forcefully unregister any ghost SW and
    // purge its caches so returning users stop seeing old versions. Reload once
    // after a ghost SW is killed so the fresh, un-intercepted bundle loads.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        if (regs.length === 0) return
        Promise.all(regs.map(r => r.unregister())).then(() => {
          if ('caches' in window) caches.keys().then(keys => keys.forEach(k => caches.delete(k)))
          if (!sessionStorage.getItem('lore_sw_killed')) {
            sessionStorage.setItem('lore_sw_killed', '1')
            location.reload()
          }
        })
      }).catch(() => {})
    }

    ;(async () => {
      try {
        // ensureSession transparently creates an anonymous session on first
        // visit, persisted in localStorage — same device = same user_id forever.
        const session = await ensureSession()
        analytics.init(session?.user?.id ?? null)
        analytics.track('session_started', null, { authed: !!session })
        const s = await loadGameState()
        hydrateProgress(s)
        // Hydrate all DM threads up front: previews render, threads open, and
        // the opener-seeding effect sees real history instead of racing an
        // empty inbox. Merge under any messages that landed while loading.
        loadAllDMs().then(all => {
          const chars = Object.keys(all) as CharId[]
          chars.forEach(cid => dmDbLoadedRef.current.add(cid))
          setDmHistory(prev => {
            const next = { ...prev }
            for (const cid of chars) {
              const db = all[cid] ?? []
              const inMemory = next[cid] ?? []
              const dbKeys = new Set(db.map(m => `${m.role}:${m.text}`))
              next[cid] = [...db, ...inMemory.filter(m => !dbKeys.has(`${m.role}:${m.text}`))]
            }
            return next
          })
          if (chars.length) setDmLastUpdated(prev => {
            const next = { ...prev }
            for (const cid of chars) next[cid] = next[cid] ?? Date.now()
            return next
          })
        }).catch(() => {})
        // Route signal: session ordinal lets us slice "second session, which
        // screen did they open first" — the Sims-vs-companion-vs-story decider.
        try {
          const ord = parseInt(localStorage.getItem('lore_session_ord') ?? '0', 10) + 1
          localStorage.setItem('lore_session_ord', String(ord))
          sessionOrdinalRef.current = ord
        } catch {}
        // New/guest visitors land on login first; returning (signed-in, non-anon)
        // users skip straight into the app. Guests can still choose "keep playing
        // as guest" on the login screen to continue without an account.
        const authed = !!session?.user && !session.user.is_anonymous
        navigate(!authed ? 'login' : (s.playerName ? 'worlds' : 'onboarding'), { replace: true })
      } catch {
        analytics.init(null)
        navigate('worlds', { replace: true })
      } finally {
        setReady(true)
      }
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Return ritual: the app opens on a fresh match day (weekUnlockAt passed) →
  // Maddy is already waiting in DMs before any menu. Once per week.
  useEffect(() => {
    if (!ready || game.world !== 'cricket') return
    const w = game.week ?? 1
    if (!game.weekUnlockAt || Date.now() < game.weekUnlockAt) return
    try {
      const key = `lore_return_ping_w${w}`
      if (localStorage.getItem(key)) return
      localStorage.setItem(key, '1')
      const lines: Record<number, string> = {
        2: 'BRO. AAJ. MATCH. 🏟️ Utha ja — sheet lag chuki hogi. Main abhi se nervous hoon aur main list mein bhi nahi.',
        3: 'Eliminator week bhai. Poora school bol raha hai tera naam. AAJ sab decide hota hai — phone mat band karna.',
      }
      const text = lines[w] ?? 'Bro aaj ka din bada hai. Phone paas rakh.'
      setTimeout(() => notifyDMRef.current?.('friend', text, undefined, { day: (w - 1) * 4 + 2, phase: 'MORNING', note: 'Match day' }), 1800)
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, game.world, game.week, game.weekUnlockAt])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }, [])

  const navigate = useCallback((to: Screen, opts?: { replace?: boolean }) => {
    // first_screen_opened: the first user-initiated navigation of the session
    // (replace:true navs are app routing, not user choice). With the session
    // ordinal this answers "second session — which surface did they open first",
    // the route-deciding metric from the design doc.
    if (!opts?.replace && !firstNavTrackedRef.current) {
      firstNavTrackedRef.current = true
      analytics.track('first_screen_opened', game.world ?? null, {
        screen: to,
        session_ordinal: sessionOrdinalRef.current,
      })
    }
    setScreen(prev => {
      analytics.trackScreen(to, game.world ?? null, prev)
      return to
    })
    setNavHistory(prev => opts?.replace ? [...prev.slice(0, -1), to] : [...prev, to])
  }, [game.world])

  // Auto-persist relationship/social progress shortly after it changes.
  // Game-state saves fire on choices; trust/fame/like changes happen on their own,
  // so this debounced effect makes sure they reach Supabase too.
  useEffect(() => {
    if (!ready || !gameRef.current.playerName) return
    const t = setTimeout(() => {
      saveGameState({ ...gameRef.current, ...extrasSnapshot() }).catch(() => {})
    }, 800)
    return () => clearTimeout(t)
  }, [dmTrust, charFame, likedPosts, ready, extrasSnapshot])

  const goBack = useCallback(() => {
    setNavHistory(prev => {
      if (prev.length <= 1) return prev
      const next = prev.slice(0, -1)
      setScreen(next[next.length - 1])
      return next
    })
  }, [])

  // Android hardware back = one screen back in-app; at the root, minimize
  // instead of killing the app mid-session. (Closed-test blocker + founder ask.)
  const navHistoryRef = useRef(navHistory); navHistoryRef.current = navHistory
  useEffect(() => {
    let remove: (() => void) | undefined
    ;(async () => {
      try {
        const { Capacitor } = await import('@capacitor/core')
        if (!Capacitor.isNativePlatform()) return
        const { App: CapApp } = await import('@capacitor/app')
        const h = await CapApp.addListener('backButton', () => {
          if (navHistoryRef.current.length > 1) goBack()
          else CapApp.minimizeApp()
        })
        remove = () => h.remove()
      } catch { /* web / plugin unavailable */ }
    })()
    return () => remove?.()
  }, [goBack])

  const saveAndSet = useCallback((next: GameState) => {
    setGame(next)
    // Merge relationship/social progress so it persists with every write
    saveGameState({ ...next, ...extrasSnapshot() })
  }, [extrasSnapshot])

  const setChar = useCallback((id: CharId) => {
    saveAndSet({ ...game, char: id, situation: 0, choices: [], meters: charMeters(id), narrator_done: true, dayUnlockTime: {} })
  }, [saveAndSet, game])

  // Migrate older Creator House saves whose situation queue was capped to Day 1 —
  // rebuild it to the full Season-1 arc so the story flows freely Day 1 → Day 10.
  // (Self-heals on every load; persists with the next choice write.)
  useEffect(() => {
    if (game.world !== 'creator-house') return
    const full = buildCHQueue(game.meters, game.choices)
    if (game.situationQueue.length < full.length) {
      setGame(g => ({ ...g, situationQueue: full }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.world, game.situationQueue.length])

  const saveProfile = useCallback(async (name: string, gender: 'male' | 'female', avatarUrl?: string) => {
    const updated: GameState = { ...game, playerName: name, playerGender: gender, avatarUrl }
    setGame(updated)
    await saveGameState({ ...updated, ...extrasSnapshot() }, getDeviceId())
    analytics.track('onboarding_completed', null, { gender, has_avatar: !!avatarUrl })
    // Expose a setter on window so the async avatar generator can update without re-rendering onboarding
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).__lore_set_avatar = (url: string) => {
        setGame(prev => {
          const next = { ...prev, avatarUrl: url }
          saveGameState({ ...next, ...extrasSnapshot() }).catch(() => {})
          return next
        })
      }
    }
    const pending = typeof window !== 'undefined' ? localStorage.getItem('lore_pending_world') : null
    if (pending === 'creator-house') {
      localStorage.removeItem('lore_pending_world')
      navigate('world-intro')
    } else if (pending === 'cricket') {
      // Fresh cricket player just named themselves — start the run now instead of
      // bouncing to Worlds (which would replay the carousel). Mirrors startCricketGame.
      localStorage.removeItem('lore_pending_world')
      localStorage.setItem('lore_feed_seen', '1')
      localStorage.removeItem('lore_dm_openers_v1')
      localStorage.removeItem('lore_dm_cap'); localStorage.removeItem('lore_dm_seen_v1')
      const cricketState: GameState = {
        playerName: name, playerGender: gender, avatarUrl,
        world: 'cricket', char: 'player',
        situation: 0, situationQueue: buildCricketQueue(), choices: [],
        meters: { form: 40, fame: 25 },
        flags: DEFAULT_FLAGS, runMemory: {},
        narrator_done: true, dayUnlockTime: {},
        week: 1,
      }
      setDmTrust({ ...getCricketDMTrustStart() })
      setRelationshipAlerts([])
      saveAndSet(cricketState)
      analytics.track('world_entered', 'cricket', { world_id: 'cricket' })
      navigate('feed')
    } else {
      navigate('worlds')
    }
  }, [game, navigate, extrasSnapshot, saveAndSet])

  const startGame = useCallback(() => {
    if (!game.playerName) {
      if (typeof window !== 'undefined') localStorage.setItem('lore_pending_world', 'creator-house')
      navigate('onboarding')
      return
    }
    const newState: GameState = {
      playerName: game.playerName, playerGender: game.playerGender,
      // char:'player' is the self-sentinel (same as cricket). We land straight on Live —
      // the separate narrator/cast screen is gone; the cast is met via the feed.
      world: 'creator-house', char: 'player',
      situation: 0, situationQueue: buildCHQueue({ fame: 20 }, []), choices: [],
      meters: { fame: 20 },
      flags: DEFAULT_FLAGS, runMemory: {},
      narrator_done: true, dayUnlockTime: {},
    }
    setRelationshipAlerts([])
    saveAndSet(newState)
    analytics.track('world_entered', 'creator-house', { world_id: 'creator-house' })
    recordWorldEntered('creator-house')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lore_feed_seen')
      localStorage.removeItem('lore_dm_openers_v1') // fresh run re-seeds openers
      localStorage.removeItem('lore_dm_cap'); localStorage.removeItem('lore_dm_seen_v1')        // fresh run clears DM throttle
    }
    // Land on the Feed (the world hub) — Live is entered from the Feed/Messages
    // banner, not as the first screen.
    navigate('feed')
  }, [game.playerName, game.playerGender, saveAndSet, navigate])

  const startCricketGame = useCallback(() => {
    // char:'player' sentinel — the player is themselves, not Hardik Pandya
    const newState: GameState = {
      playerName: game.playerName, playerGender: game.playerGender,
      world: 'cricket', char: 'player',
      situation: 0, situationQueue: buildCricketQueue(), choices: [],
      meters: { form: 40, fame: 25 },
      flags: DEFAULT_FLAGS, runMemory: {},
      narrator_done: true, dayUnlockTime: {},
      week: 1,
    }
    setDmTrust({ ...getCricketDMTrustStart() })
    setRelationshipAlerts([])
    saveAndSet(newState)
    analytics.track('world_entered', 'cricket', { world_id: 'cricket' })
    recordWorldEntered('cricket')
    if (typeof window !== 'undefined') {
      localStorage.setItem('lore_feed_seen', '1')
      localStorage.removeItem('lore_dm_cap'); localStorage.removeItem('lore_dm_seen_v1')        // fresh run clears DM throttle
    }
    // First open lands ON THE STORY — S1 is the dopamine beat; the feed is met
    // after your first choice creates something on it (founder + CEO review P0).
    navigate('live')
  }, [game.playerName, game.playerGender, saveAndSet, navigate])

  const queueLowTrustAlert = useCallback((_charId: CharId) => {
    // low-trust feed posts disabled
  }, [game.world])

  const adjustIndividualTrust = useCallback((charId: CharId, delta: number) => {
    if (!delta || charId === 'player') return
    setDmTrust(prev => {
      const base = prev[charId] ?? defaultDmTrustFor(game.world, charId)
      const next = clampTrust(base + delta)
      if (game.world === 'cricket' && base >= 30 && next < 30) queueLowTrustAlert(charId)
      return { ...prev, [charId]: next }
    })
  }, [game.world, queueLowTrustAlert])

  const applyChoiceRelationshipEffects = useCallback((sit: { react?: { char: CharId } | null }, ch: NonNullable<Situation['choices'][number]>, previousMeters: GameState['meters'], nextMeters: GameState['meters']) => {
    if (game.world !== 'cricket') {
      // Creator House: apply the authored per-character bond deltas directly.
      // Gender-swap the id (kabir<->ananya) so a FEMALE player's crush/ally bonds
      // are credited to the character actually shown — same swap as DM/feed delivery.
      Object.entries(ch.relationshipDeltas ?? {}).forEach(([id, delta]) => adjustIndividualTrust(chCharForGender(id, game.playerGender) as CharId, delta ?? 0))
      return
    }
    const deltas: Partial<Record<CharId, number>> = {}
    const add = (id: CharId, delta: number) => {
      if (!delta || id === 'player') return
      deltas[id] = (deltas[id] ?? 0) + delta
    }
    const touched = new Set<CharId>()
    if (sit.react?.char) touched.add(sit.react.char)
    ch.reactions?.forEach(rx => { if (rx.char !== '__fan') touched.add(rx.char) })
    asArray(ch.dm).forEach(dm => touched.add(dm.char))
    asArray(ch.post).forEach(post => { if (post.source === 'character' && post.char) touched.add(post.char) })
    Object.keys(ch.relationshipDeltas ?? {}).forEach(id => touched.add(id as CharId))

    // Pooled Team Trust is gone — per-senior trust now moves ONLY through
    // authored relationshipDeltas (the story deciding who warms/cools) plus a
    // small technical-respect echo when a form-building choice touches a senior.
    const nm = asCricket(nextMeters), pm = asCricket(previousMeters)  // cricket-only past this point
    const formDelta = nm.form - pm.form
    const technical: CharId[] = ['rohit', 'bumrah', 'coach', 'mahela']

    if (formDelta >= 2) {
      technical.forEach(id => { if (touched.has(id)) add(id, 1) })
    }

    Object.entries(ch.relationshipDeltas ?? {}).forEach(([id, delta]) => {
      add(id as CharId, delta ?? 0)
    })

    Object.entries(deltas).forEach(([id, delta]) => adjustIndividualTrust(id as CharId, delta ?? 0))
  }, [adjustIndividualTrust, game.world])

  const advanceSituation = useCallback(() => {
    // MATCH CALENDAR side effects computed OUTSIDE the state updater (StrictMode-
    // safe): week-boundary bookkeeping (companion pings removed — one-DM rule).
    {
      const g = gameRef.current
      const q = g.situationQueue
      let calOff = false
      try { calOff = localStorage.getItem('lore_cal_off') === '1' } catch {}
      // Evening companion pings removed (founder: never more than one DM push;
      // day-end guidance lives as contextual nudges on the match-calendar screen).
      void calOff; void q
    }
    setGame(prev => {
      const nextIdx = prev.situation + 1
      const queue = prev.situationQueue

      // Day gate: look up next situation by ID
      const sitMap = prev.world === 'cricket'
        ? Object.fromEntries(getCricketSituations().map(s => [s.id, s]))
        : Object.fromEntries(getVisibleSituations(prev.meters, prev.choices).map(s => [s.id, s]))
      const currentSit = sitMap[queue[prev.situation]]
      const nextSit    = sitMap[queue[nextIdx]]
      const newUnlockTime = { ...prev.dayUnlockTime }
      // Day gate: disabled for user testing (restore to 6 * 60 * 60 * 1000 for prod)
      const gateMs = 0
      if (nextSit && currentSit && nextSit.day > currentSit.day && !newUnlockTime[nextSit.day]) {
        newUnlockTime[nextSit.day] = Date.now() + gateMs
      }
      const next = { ...prev, situation: nextIdx, situationQueue: queue, dayUnlockTime: newUnlockTime }

      // Cricket MATCH CALENDAR: crossing a week boundary sets the next-morning
      // unlock (7am local) and the evening begins — companion pings arrive and
      // the engagement slate (earn-a-skip) resets. Dev bypass: ?cal=off.
      if (prev.world === 'cricket' && nextIdx < queue.length && isWeekEnd(queue, prev.situation)) {
        let calOff = false
        try { calOff = localStorage.getItem('lore_cal_off') === '1' } catch {}
        if (!calOff) {
          const next7am = new Date()
          next7am.setDate(next7am.getDate() + 1)
          next7am.setHours(7, 0, 0, 0)
          next.weekUnlockAt = next7am.getTime()
          next.interlude = { ...FRESH_INTERLUDE, chatTrustEarned: {}, charsChatted: [] }
          // The 7am pull-back: local push when the next match-week opens.
          scheduleMatchDayNotification(next.weekUnlockAt, (prev.week ?? 1) + 1).catch(() => {})
        }
      }

      // Cricket: finishing a selection-trigger beat opens the SELECTION WINDOW
      // (free-flow — no lock). The next beat is gated behind the squad-announcement
      // ceremony; nets/DMs/feed stay open as the optional case-building grind.
      if (prev.world === 'cricket') {
        const finishedId = queue[prev.situation]
        const selId = SELECTION_TRIGGERS[finishedId]
        if (selId && !(prev.selections ?? {})[selId]) {
          next.week = weekForSituationId(finishedId)
          next.pendingSelection = selId
          next.interlude = { ...FRESH_INTERLUDE, chatTrustEarned: {} }
          analytics.track('selection_window_started', 'cricket', {
            selection: selId,
            week: next.week,
            form: (prev.meters as { form?: number }).form,
            captain_trust: captainTrust(dmTrustRef.current),
          })
        }
      }

      // Creator House: finishing an eviction-trigger situation fires Eviction Night
      // before the next beat (built on top of the existing storyline).
      if (prev.world === 'creator-house') {
        const finishedId = queue[prev.situation]
        const evId = EVICTION_TRIGGERS[finishedId]
        const seen = prev.evictionsSeen ?? []
        if (evId && !seen.includes(evId)) {
          next.pendingEviction = evId
          next.evictionsSeen = [...seen, evId]
          analytics.track('eviction_night', 'creator-house', { eviction: evId, after: finishedId })
        }
      }

      saveGameState({ ...next, ...extrasSnapshot() })
      return next
    })
  }, [extrasSnapshot]) // functional update reads prev; extrasSnapshot is stable

  // Close an eviction ceremony: record who left, clear pending, continue the story.
  const resolveEviction = useCallback(() => {
    setGame(prev => {
      const ev = prev.pendingEviction ? buildEviction(prev.pendingEviction, prev) : null
      // Player voted out → the run is over. Reset the house so re-entry is a fresh
      // start (the resume guards key off situation>0 && char), keeping name/gender.
      if (ev?.playerEvicted) {
        const next: GameState = {
          ...prev,
          char: null, situation: 0, choices: [], pendingEviction: null,
          evictionsSeen: [], evicted: [], interlude: undefined,
        }
        saveGameState({ ...next, ...extrasSnapshot() })
        return next
      }
      const next: GameState = {
        ...prev,
        pendingEviction: null,
        evicted: ev ? [...(prev.evicted ?? []), ev.evicted] : (prev.evicted ?? []),
      }
      saveGameState({ ...next, ...extrasSnapshot() })
      return next
    })
  }, [extrasSnapshot])

  // Resolve the pending squad selection: compute + PERSIST the verdict (the
  // replay-safe ground truth beat variants key on), advance the week, clear the
  // window. Called by SelectionScreen's final CTA.
  const resolveSelection = useCallback(() => {
    setGame(prev => {
      const selId = prev.pendingSelection
      if (!selId) return prev
      const week = selectionWeek(selId)
      const form = Math.round((prev.meters as { form?: number }).form ?? 40)
      const captain = captainTrust(dmTrustRef.current)
      const benched = prev.benchedWeeks ?? []
      const verdict = resolveSelectionVerdict(week, form, captain, benched)
      const recall = isRecall(week, form, captain, benched)
      const next: GameState = {
        ...prev,
        week: Math.min(week + 1, SEASON_WEEKS.length),
        pendingSelection: null,
        selections: { ...(prev.selections ?? {}), [selId]: verdict },
        benchedWeeks: verdict === 'benched' ? [...benched, week] : benched,
        flags: recall ? { ...prev.flags, recalled: 1 } : prev.flags,
      }
      analytics.track('selection_verdict', 'cricket', { selection: selId, week, verdict, recall, form, captain_trust: captain })
      saveGameState({ ...next, ...extrasSnapshot() })
      return next
    })
  }, [extrasSnapshot])

  // Earn-a-skip: the engagement slate is done — the next match-week opens early.
  const skipWeekWait = useCallback(() => {
    setGame(prev => {
      if (!prev.weekUnlockAt) return prev
      const next: GameState = { ...prev, weekUnlockAt: null }
      cancelMatchDayNotification().catch(() => {})
      analytics.track('week_skip_earned', 'cricket', { week: prev.week })
      saveGameState({ ...next, ...extrasSnapshot() })
      return next
    })
  }, [extrasSnapshot])


  const makeChoice = useCallback(async (idx: number) => {
    // Look up current situation by ID from the queue (world-aware, index-shift-safe)
    const currentId = game.situationQueue[game.situation]
    const sitMap = game.world === 'cricket'
      ? Object.fromEntries(getCricketSituations().map(s => [s.id, s]))
      : Object.fromEntries(getVisibleSituations(game.meters, game.choices).map(s => [s.id, s]))
    const rawSit = sitMap[currentId]
    // Cricket: resolve the SAME variant LiveScreen rendered (deltas must match
    // what was shown) and PERSIST it + the gate result for replay safety.
    const variantIdx = rawSit && game.world === 'cricket'
      ? resolveVariantIndex(rawSit, variantCtxFor(game, dmTrustRef.current, weekForSituationId(rawSit.id)))
      : -1
    const sit = rawSit && game.world === 'cricket' ? applyVariant(rawSit, variantIdx) : rawSit
    const ch = sit?.choices?.[idx]
    if (!ch) return
    const gateRes = resolveGateOutcome(ch, game.meters, dmTrustRef.current)
    bumpChoices() // lifetime choice counter for the global profile
    const letter = idx === 0 ? 'A' : 'B'
    const newMeters = applyDeltas(game.meters, ch.deltas)
    const newFlags = applyFlagDeltas(game.flags, ch.flagDeltas)
    const newChoices = [...game.choices, letter] as ('A'|'B')[]
    // Write run memory if this is a match situation
    // A failed charTrust gate means you never got to bat (e.g. the impact-sub
    // call didn't come) — no runs to remember.
    const neverBatted = gateRes?.result === 'fail' && ch.outcomeGate?.metric === 'charTrust'
    const newRunMemory = ch.runWrite && !neverBatted
      ? { ...game.runMemory, [`${ch.runWrite}Runs`]: asCricket(newMeters).form, [`${ch.runWrite}Balls`]: undefined }
      : game.runMemory
    setGame(prev => ({
      ...prev, meters: newMeters, flags: newFlags, choices: newChoices, runMemory: newRunMemory,
      ...(prev.world === 'cricket' ? {
        gateResults: gateRes ? { ...(prev.gateResults ?? {}), [currentId]: gateRes.result } : prev.gateResults,
        variantSeen: { ...(prev.variantSeen ?? {}), [currentId]: variantIdx },
        // DM mission: the story sends YOU to open this senior's thread.
        ...(ch.dmMission ? { activeMission: ch.dmMission } : {}),
      } : {}),
    }))
    applyChoiceRelationshipEffects(sit, ch, game.meters, newMeters)
    analytics.track('choice_made', game.world, {
      situation_id: currentId,
      choice: letter,
      situation_index: game.situation,
      day: sit.day,
      ...(game.world === 'cricket'
        ? { form_after: asCricket(newMeters).form, fame_after: asCricket(newMeters).fame, captain_trust_after: captainTrust(dmTrustRef.current) }
        : { fame_after: newMeters.fame }),
    })
    await recordChoice(game.situation, letter)
  }, [applyChoiceRelationshipEffects, game])

  const openDMThread = useCallback(async (charId: CharId) => {
    setDmChar(charId)
    navigate('dm-thread')
    setDmBadgeCount(0) // clear badge on open
    analytics.track('dm_opened', game.world, { char_id: charId })
    if (!dmDbLoadedRef.current.has(charId)) {
      dmDbLoadedRef.current.add(charId)
      const msgs = await loadDMs(charId)
      setDmHistory(prev => {
        // Merge: DB history first, then any in-memory messages not yet in DB
        // (injectCharDM fires saveDM async — there may be a small timing gap)
        const inMemory = prev[charId] ?? []
        const dbKeys = new Set(msgs.map(m => `${m.role}:${m.text}`))
        const onlyInMemory = inMemory.filter(m => !dbKeys.has(`${m.role}:${m.text}`))
        // The DB doesn't store post embeds — re-attach them from the in-memory copy.
        const dbWithEmbeds = msgs.map(m => {
          const mem = inMemory.find(im => im.role === m.role && im.text === m.text)
          // Re-attach what the DB doesn't store: post embeds AND the narrative
          // timestamps (day/phase/t/note) — else same-session threads lose their
          // WhatsApp dividers the moment the DB merge runs.
          return mem ? { ...m, ...(mem.embed ? { embed: mem.embed } : {}), day: mem.day, phase: mem.phase, t: mem.t, note: mem.note } : m
        })
        const merged = [...dbWithEmbeds, ...onlyInMemory]
        if (merged.length > 0) setDmLastUpdated(times => ({ ...times, [charId]: times[charId] ?? Date.now() }))
        return { ...prev, [charId]: merged }
      })
    }
  }, [game.world, navigate])

  // ── DM economy (localStorage-backed) ─────────────────────────────────────
  // Cricket: DMs are always open with a per-day free-chat budget per senior
  // (DM_DAILY_BUDGET; mission exchanges don't consume it). CH keeps the crush's
  // short precious window (7 msgs / 30-min cooldown).
  const dmCapFor = (cid: string) => (gameRef.current.world === 'cricket' ? DM_DAILY_BUDGET : cid === 'ananya' ? 7 : 20)
  const dmLockMsFor = (cid: string) => (cid === 'ananya' ? 30 * 60 * 1000 : 6 * 60 * 60 * 1000)
  // Day key so cricket budgets reset daily (count is stored per day).
  const dmDayKey = () => new Date().toISOString().slice(0, 10)

  const getDmCapState = useCallback((cid: string) => {
    try {
      const raw = localStorage.getItem('lore_dm_cap')
      const all = raw ? JSON.parse(raw) : {}
      const st = (all[cid] ?? { count: 0, lockedUntil: 0 }) as { count: number; lockedUntil: number; day?: string }
      // Cricket budgets are per-day: a stale day key resets the count.
      if (gameRef.current.world === 'cricket' && st.day !== dmDayKey()) return { count: 0, lockedUntil: 0 }
      return st
    } catch { return { count: 0, lockedUntil: 0 } }
  }, [])

  const setDmCapState = useCallback((cid: string, next: { count: number; lockedUntil: number }) => {
    try {
      const raw = localStorage.getItem('lore_dm_cap')
      const all = raw ? JSON.parse(raw) : {}
      const stamped = gameRef.current.world === 'cricket' ? { ...next, day: dmDayKey() } : next
      localStorage.setItem('lore_dm_cap', JSON.stringify({ ...all, [cid]: stamped }))
    } catch {}
  }, [])

  // Build a brief narrative summary of the player's journey so far
  const buildStorySummary = useCallback(() => {
    if (game.world !== 'cricket' || game.choices.length === 0) return null
    const sitMap = Object.fromEntries(getCricketSituations().map(s => [s.id, s]))
    const lines: string[] = []
    const queue = game.situationQueue
    game.choices.forEach((letter, idx) => {
      const sitId = queue[idx]
      const sit = sitId ? sitMap[sitId] : null
      if (!sit) return
      const choiceIdx = letter === 'A' ? 0 : 1
      const choice = sit.choices[choiceIdx]
      if (!choice) return
      lines.push(`- ${sit.title}: chose "${choice.t.slice(0, 60)}"`)
    })
    return lines.length > 0 ? lines.join('\n') : null
  }, [game.world, game.choices, game.situationQueue])

  const sendDM = useCallback(async (charId: CharId, text: string) => {
    // DMs are live in both cricket and Creator House.
    // Budget/cap check. A story MISSION for this senior always goes through.
    const missionActive = gameRef.current.activeMission?.char === charId
    const capState = getDmCapState(charId)
    if (!missionActive) {
      if (gameRef.current.world === 'cricket') {
        if (capState.count >= dmCapFor(charId)) return   // daily budget spent
      } else if (capState.lockedUntil > Date.now()) return
    }

    const baseHist = dmHistory[charId] ?? []
    const userMsg: DMMessage = { role: 'me', text, ...stampTime(baseHist) }
    const contextHistory = [...baseHist, userMsg]
    let running: DMMessage[] = contextHistory  // local history so each AI bubble gets a later in-story time
    setDmHistory(prev => ({ ...prev, [charId]: [...(prev[charId] ?? []), userMsg] }))
    setDmLastUpdated(prev => ({ ...prev, [charId]: Date.now() }))
    saveDM(charId, userMsg).catch(() => {})

    // Consume budget (missions are free). Cricket: daily count; CH: cooldown lock.
    if (!missionActive) {
      const newCount = capState.count + 1
      if (gameRef.current.world === 'cricket') {
        setDmCapState(charId, { count: newCount, lockedUntil: 0 })
      } else if (newCount >= dmCapFor(charId)) {
        setDmCapState(charId, { count: newCount, lockedUntil: Date.now() + dmLockMsFor(charId) })
      } else {
        setDmCapState(charId, { count: newCount, lockedUntil: 0 })
      }
    }

    // Story-chat session: count this reply toward the scoped window.
    setDmStorySession(prev => prev && prev.char === charId ? { ...prev, sent: prev.sent + 1 } : prev)

    // Earn-a-skip slate: note the distinct characters you actually talked to.
    if (gameRef.current.world === 'cricket') {
      setGame(prev => {
        const il = prev.interlude ?? { ...FRESH_INTERLUDE, chatTrustEarned: {} }
        if ((il.charsChatted ?? []).includes(charId)) return prev
        return { ...prev, interlude: { ...il, charsChatted: [...(il.charsChatted ?? []), charId] } }
      })
    }

    const playerName = game.playerName || 'Yaar'
    const currentTrust = dmTrust[charId] ?? defaultDmTrustFor(game.world, charId)
    const trustBand = trustBandFor(currentTrust)
    const raw = await getAIReply(charId, contextHistory, playerName, {
      char: game.char,
      meters: game.meters,
      choices: game.choices,
      situation: game.situation,
      world: game.world,
      flags: game.flags,
      story: (() => {
        const base = buildStorySummary() ?? ''
        // First-ever exchange with this character: the reply IS the welcome.
        const firstContact = contextHistory.filter(m => m.role === 'char').length === 0
        if (!firstContact) return base || undefined
        return (base ? base + '\n' : '') +
          'FIRST CONTACT: yeh newcomer ka tumhe bheja pehla message hai. Apne persona ke hisaab se ek chhoti si welcome beat se shuru karo — 16-saal ke naye ladke ne khud pehal ki hai (warm ya measured, jaisa tumhara character hai) — phir uske message ka jawab do.'
      })(),
      trustWithChar: currentTrust,
      trustBand,
      trustGuidance: trustGuidanceFor(currentTrust),
      playerGender: game.playerGender,
    })
    const CRICKET_MOCK_FALLBACK: Partial<Record<string, string[]>> = {
      hardik: ['Role pe focus rakh. Kya soch raha hai abhi?', 'Execution dikhao. Simple hai na?', 'Theek hai. Kal kya plan hai?'],
      rohit:  ['Tempo samajh raha hai? Sach mein?', 'Hmm. Kya feel hua?', 'Process pe raho. Kya miss kar raha hai?'],
      surya:  ['Champion! Field dekh pehle 😄 Woh specific ball pe kya socha?', 'Energy mast hai. Ab reason bata.', 'Aaja kal nets mein. Ready hai?'],
      bumrah: ['Wrist pehle pick karo. Kar sakta hai?', 'Better. Kya different tha?', 'Kal over milega. Kya practice karoge?'],
      tilak:  ['Good. Repeat kar sakta hai? Consistently?', 'Process pe raho. Kya block hai?', 'Hota hai. Agle situation mein kya karoge?'],
      coach:  ['Kal subah 6 baje. Aa sakta hai?', '10 minute rona allowed. Phir kya?', 'Footwork pe kaam karo. Samajh aaya?'],
      friend: ['BHAI REPLY KAR 😭 Tu theek hai?', 'Tu theek hai? Genuinely pooch raha hoon.', 'Main hoon yaar. Baat kar. Kya ho raha hai?'],
    }
    const mockArr = getCHDMMock()[charId] ?? CRICKET_MOCK_FALLBACK[charId] ?? ['Haan yaar. Kya chal raha hai?', 'Interesting. Aur?', 'Hmm. Kya feel hua?']
    const reply = raw?.trim() || mockArr[Math.floor(Math.random() * mockArr.length)]

    // Split into separate chat bubbles (model uses "|||" between thoughts) and
    // deliver them one at a time with a small pause, like a real person texting.
    const bubbles = reply.split('|||').map(s => s.trim()).filter(Boolean)
    const parts = bubbles.length > 0 ? bubbles : [reply]
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) await new Promise(res => setTimeout(res, Math.min(1100, 350 + parts[i].length * 18)))
      const charMsg: DMMessage = { role: 'char', text: parts[i], ...stampTime(running) }
      running = [...running, charMsg]
      setDmHistory(prev => ({ ...prev, [charId]: [...(prev[charId] ?? []), charMsg] }))
      setDmLastUpdated(prev => ({ ...prev, [charId]: Date.now() }))
      saveDM(charId, charMsg).catch(() => {})
    }
    analytics.track('dm_sent', game.world, {
      char_id: charId,
      message_length: text.length,
      trust_before: currentTrust,
      trust_band: trustBand,
      mission: missionActive ? gameRef.current.activeMission?.flag : undefined,
    })
    if (missionActive && gameRef.current.activeMission) {
      const flag = gameRef.current.activeMission.flag
      setGame(prev => {
        const next = { ...prev, flags: { ...prev.flags, [flag]: 1 }, activeMission: null }
        saveGameState({ ...next, ...extrasSnapshot() })
        return next
      })
      showToast('Baat ho gayi ✓')
      analytics.track('dm_mission_completed', 'cricket', { char_id: charId, flag })
    }
    scoreTrustDelta(charId, text, parts.join(' '), currentTrust).then(delta => {
      if (delta === 0) return
      // Selection-window cap: casual chat earns at most +2 trust per character
      // per window (negative deltas always apply — you can still blow it).
      let applied = delta
      const windowActive = !!gameRef.current.pendingSelection || (gameRef.current.weekUnlockAt ?? 0) > Date.now()
      if (windowActive && delta > 0) {
        const interlude = gameRef.current.interlude ?? { ...FRESH_INTERLUDE, chatTrustEarned: {} }
        const earned = interlude.chatTrustEarned[charId] ?? 0
        applied = Math.min(delta, Math.max(0, INTERLUDE_CAPS.chatTrustPerChar - earned))
        if (applied > 0) {
          setGame(prev => {
            const il = prev.interlude ?? { ...FRESH_INTERLUDE, chatTrustEarned: {} }
            const next = {
              ...prev,
              interlude: { ...il, chatTrustEarned: { ...il.chatTrustEarned, [charId]: (il.chatTrustEarned[charId] ?? 0) + applied } },
            }
            saveGameState({ ...next, ...extrasSnapshot() })
            return next
          })
        }
      }
      if (applied !== 0) adjustIndividualTrust(charId, applied)
    }).catch(() => {})
  }, [adjustIndividualTrust, dmHistory, game, dmTrust, getDmCapState, setDmCapState, buildStorySummary, extrasSnapshot])

  // Like a post — updates player fame + target character's fame (idempotent: no double-like)
  const likePost = useCallback((postId: string, charId: CharId, _fameDelta: number) => {
    if (likedPosts.has(postId)) return  // already liked — full no-op
    setLikedPosts(prev => { const n = new Set(prev); n.add(postId); return n })
    // A like is low-stakes: liking someone ELSE's post never grows YOUR audience.
    // It just gets noticed by that creator — a small private trust nudge. The real
    // stakes (followers, drama, DMs) live in *commenting*, not liking.
    adjustIndividualTrust(charId, 1)
    const allChars = game.world === 'cricket' ? { ...getCHChars(), ...getCricketChars() } : getCHChars()
    const charName = allChars[charId]?.name
    if (charName) showToast(`Liked ${charName}'s post ❤️`)
  }, [likedPosts, adjustIndividualTrust, game.world, showToast])

  // A posted comment BELONGS to the post — persist it and render it under the
  // post like a real comment (founder call, Jul 4).
  const addPostComment = useCallback((postId: string, text: string) => {
    if (!text.trim()) return
    setPostComments(prev => {
      const next = { ...prev, [postId]: text.trim() }
      postCommentsRef.current = next
      saveGameState({ ...gameRef.current, ...extrasSnapshot() }).catch(() => {})
      return next
    })
  }, [extrasSnapshot])

  // Inject a DM message from a character without AI round-trip (used after Live choices).
  // `meta` carries the story beat's day/phase/event so the thread can show a
  // "DAY 2 · MORNING" divider + an in-story timestamp on the message.
  const injectCharDM = useCallback((charId: CharId, text: string, embed?: DMMessage['embed'], meta?: DMTimeMeta) => {
    let created: DMMessage | undefined
    setDmHistory(prev => {
      const hist = prev[charId] ?? []
      created = { role: 'char', text, ...(embed ? { embed } : {}), ...stampTime(hist, meta) }
      return { ...prev, [charId]: [...hist, created] }
    })
    setDmLastUpdated(prev => ({ ...prev, [charId]: Date.now() }))
    if (created) saveDM(charId, created).catch(() => {})
    setDmBadgeCount(prev => prev + 1) // T4: badge notification
  }, [])

  // Inject a DM AND raise the app-wide notification banner. Used by the feed
  // reveal so a "the world reacts" DM surfaces as a notification on any screen.
  const notifyDM = useCallback((charId: CharId, text: string, embed?: DMMessage['embed'], meta?: DMTimeMeta, opts?: { story?: boolean }) => {
    injectCharDM(charId, text, embed, meta)
    const c = ({ ...getCHChars(), ...getCricketChars() })[charId]
    // The arrival sheet "types in" this text; it stays until the player taps Reply
    // or dismisses ("read later") — no auto-timeout, the DM demands a beat.
    // story: this arrival is a BEAT outcome — replying opens a scoped story chat.
    setDmNotif({ id: charId, name: c?.name ?? 'Someone', cls: c?.cls ?? '', text, story: opts?.story })
  }, [injectCharDM])
  const notifyDMRef = useRef(notifyDM); notifyDMRef.current = notifyDM

  // Merge a live-generated player post (caption / reactions) into game state and
  // persist it, so the feed shows the same gpt-4o text on every replay + reload.
  const upsertAiPost = useCallback((key: string, patch: Partial<AiPost>) => {
    setGame(prev => {
      const cur = prev.aiPosts?.[key] ?? { caption: '', reactions: [] as Reaction[] }
      const next = { ...prev, aiPosts: { ...(prev.aiPosts ?? {}), [key]: { ...cur, ...patch } } }
      saveGameState({ ...next, ...extrasSnapshot() }).catch(() => {})
      return next
    })
  }, [extrasSnapshot])

  const showFollowerReceipt = useCallback((delta: number) => {
    setFollowerReceipt({ delta })
    setTimeout(() => setFollowerReceipt(null), 3600)
  }, [])


  const applyFeedDeltas = useCallback((deltas: Partial<{ form: number; fame: number; trust: number }>, charId?: string, charName?: string, relationshipDeltas?: Partial<Record<string, number>>) => {
    const isCricket = game.world === 'cricket'
    // Meters take only the keys they carry ({form,fame} cricket / {fame} CH);
    // a `trust` delta now means PER-CHARACTER trust with the post's author —
    // feed engagement building a real bond, not a pooled number.
    const nextMeters = applyDeltas(game.meters, deltas as Partial<Record<'fame', number>>)
    const publicFame = nextMeters.fame            // followers axis (both worlds read .fame)
    const publicFameDelta = deltas.fame ?? 0
    const charTrustDelta = isCricket && charId ? (deltas.trust ?? 0) : 0
    if (charTrustDelta !== 0 && charId) adjustIndividualTrust(charId as CharId, charTrustDelta)
    // Comment-hook bonds: replies can move OTHER characters too (e.g. backing
    // Naman also warms Hardik) — feed talk the story reads back.
    Object.entries(relationshipDeltas ?? {}).forEach(([id, d]) => { if (d) adjustIndividualTrust(id as CharId, d) })
    const tasksTotal = game.situationQueue.length || (isCricket ? buildCricketQueue().length : getCHSituations().length)
    const il = game.interlude ?? { ...FRESH_INTERLUDE, chatTrustEarned: {} }
    saveAndSet({ ...game, meters: nextMeters, ...(isCricket ? { interlude: { ...il, repliesUsed: il.repliesUsed + 1 } } : {}) })
    showImpact({
      action: charName ? `Commented on ${charName}'s post` : 'Commented',
      followerDelta: Math.round(publicFameDelta * 180),
      followerTotal: fameToFollowers(publicFame),
      charId, charName,
      trustDelta: charTrustDelta,
      trustVal: charId ? clampTrust((dmTrustRef.current[charId] ?? 30) + charTrustDelta) : 0,
      tasksLeft: Math.max(0, tasksTotal - game.situation - 1),
      tasksTotal,
    })
  }, [game, saveAndSet, showImpact, adjustIndividualTrust])

  const setViewingChar = useCallback((id: CharId | null) => {
    setViewingCharId(id)
    if (id) navigate('char-profile')
  }, [navigate])

  const resetGame = useCallback(async () => {
    await resetGameState()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lore_dm_cap'); localStorage.removeItem('lore_dm_seen_v1')
      localStorage.removeItem('lore_feed_seen')
      localStorage.removeItem('lore_dm_openers_v1')
    }
    setGame({ playerName: '', playerGender: 'male' as const, world: 'creator-house', char: null, situation: 0, situationQueue: [], choices: [], meters: { fame: 20 }, flags: DEFAULT_FLAGS, runMemory: {}, narrator_done: false, dayUnlockTime: {} })
    setDmHistory({})
    setDmLastUpdated({})
    setDmTrust({})
    setRelationshipAlerts([])
    navigate('worlds', { replace: true })
  }, [navigate])


  // Story-chat session ends the moment you leave the thread.
  useEffect(() => {
    if (screen !== 'dm-thread' && dmStorySession) setDmStorySession(null)
  }, [screen, dmStorySession])

  const prev = navHistory[navHistory.length - 2] ?? null

  if (!ready) return (
    <div className="stage">
      <div className="phone">
        <LoadingScreen />
      </div>
    </div>
  )

  return (
    <AppContext.Provider value={{
      screen, prevScreen: prev, dmChar, game, dmHistory, dmLastUpdated, dmTrust, relationshipAlerts, charFame, likedPosts, viewingCharId, toast, impactNotif, showImpact,
      dmBadgeCount, clearDmBadge,
      saveProfile,
      advanceSituation, navigate, goBack, showToast, setChar, startGame, startCricketGame,
      makeChoice, sendDM, openDMThread, resetGame, likePost, applyFeedDeltas, injectCharDM, setViewingChar, postComments, addPostComment,
      pendingPostReveal, setPendingPostReveal, upsertAiPost, dmNotif, notifyDM, followerReceipt, showFollowerReceipt, hudReaction, setHudReaction,
      resolveSelection, skipWeekWait, resolveEviction,
      dmStorySession, startDmStorySession,
    }}>
      <div className="stage">
        <div className="phone">
          <ErrorBoundary>
          <div className="viewport">
            <Slot id="onboarding"    cur={screen} prev={prev}><OnboardingScreen /></Slot>
            <Slot id="login"         cur={screen} prev={prev}><LoginScreen /></Slot>
            <Slot id="worlds"        cur={screen} prev={prev}><WorldsScreen /></Slot>
            <Slot id="world-intro"   cur={screen} prev={prev}><WorldIntroScreen /></Slot>
            <Slot id="cricket-intro"    cur={screen} prev={prev}><CricketIntroScreen /></Slot>
            <Slot id="cricket-carousel" cur={screen} prev={prev}><CricketCarouselScreen /></Slot>
            <Slot id="feed"        cur={screen} prev={prev}><FeedScreen /></Slot>
            <Slot id="narrator"    cur={screen} prev={prev}><NarratorScreen /></Slot>
            <Slot id="live"        cur={screen} prev={prev}><LiveScreen /></Slot>
            <Slot id="selection"   cur={screen} prev={prev}><SelectionScreen /></Slot>
            <Slot id="eviction"    cur={screen} prev={prev}><EvictionScreen /></Slot>
            <Slot id="dm-inbox"    cur={screen} prev={prev}><DMInboxScreen /></Slot>
            <Slot id="dm-thread"   cur={screen} prev={prev} sheet={game.world === 'cricket'}><DMThreadScreen /></Slot>
            <Slot id="profile"     cur={screen} prev={prev}><ProfileScreen /></Slot>
            <Slot id="profile-global" cur={screen} prev={prev}><GlobalProfileScreen /></Slot>
            <Slot id="char-profile" cur={screen} prev={prev}><CharProfileScreen /></Slot>
          </div>
          </ErrorBoundary>

          {/* App-wide DM arrival — fired when the world DMs you. The character
              "types in" from the thumb zone; Reply opens the thread, swipe-down reads later. */}
          {dmNotif && (
            <DMArrivalSheet
              notif={dmNotif}
              onOpen={() => { const id = dmNotif.id as CharId; const isStory = !!dmNotif.story; setDmNotif(null); if (isStory) startDmStorySession(id); openDMThread(id) }}
              onDismiss={() => setDmNotif(null)}
            />
          )}

          {/* Transient "+N followers" receipt — the public win surfaced on the feed. */}
          {followerReceipt && (
            <div style={{ position: 'absolute', top: dmNotif ? 70 : 12, left: '50%', transform: 'translateX(-50%)', zIndex: 60, padding: '8px 16px', borderRadius: 999, background: 'linear-gradient(135deg, #ff2d78, #ff6a3d)', color: '#fff', fontWeight: 800, fontSize: 13.5, boxShadow: '0 8px 22px rgba(255,45,120,.45)', whiteSpace: 'nowrap', animation: 'slideUp .4s cubic-bezier(.32,.72,0,1) both' }}>
              ▲ +{followerReceipt.delta.toLocaleString('en-IN')} followers
            </div>
          )}

          {/* Feedback button — only visible at ?dev=1 */}
          <FeedbackButton />
        </div>
      </div>
    </AppContext.Provider>
  )
}

function Slot({ id, cur, prev, children, sheet }: { id: Screen; cur: Screen; prev: Screen | null; children: React.ReactNode; sheet?: boolean }) {
  // sheet: the screen ENTERS AS A BOTTOM SHEET (choice-to-dm morph prototype) —
  // vertical expansion instead of the lateral slide, so choice → chat reads as
  // one continuous surface.
  const cls = `${sheet ? 'screen sheet' : 'screen'}${cur === id ? ' active' : prev === id ? ' behind' : ''}`
  return <section className={cls} id={`s-${id}`}>{children}</section>
}
