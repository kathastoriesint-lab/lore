'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CharId, DMMessage, GameState, Screen } from '@/lib/types'
import { AppContext, ImpactNotif, RelationshipAlert } from '@/lib/context'
import {
  applyDeltas, applyFlagDeltas, charMeters, ensureSession, getAIReply, scoreTrustDelta,
  loadDMs, loadGameState, recordChoice, resetGameState, saveDM, saveGameState,
  fameToFollowers, DEFAULT_FLAGS, buildCricketQueue, buildCHQueue,
} from '@/lib/game'
import { CHARS, SITUATIONS, DM_MOCK, getVisibleSituations } from '@/lib/data'
import { CRICKET_CHARS, CRICKET_DM_TRUST_START, CRICKET_LOW_TRUST_FEED, CRICKET_SITUATIONS } from '@/lib/cricket-data'
import WorldsScreen from '@/components/screens/WorldsScreen'
import WorldIntroScreen from '@/components/screens/WorldIntroScreen'
import FeedScreen from '@/components/screens/FeedScreen'
import NarratorScreen from '@/components/screens/NarratorScreen'
import LiveScreen from '@/components/screens/LiveScreen'
import DMInboxScreen from '@/components/screens/DMInboxScreen'
import DMThreadScreen from '@/components/screens/DMThreadScreen'
import ProfileScreen from '@/components/screens/ProfileScreen'
import CharProfileScreen from '@/components/screens/CharProfileScreen'
import OnboardingScreen from '@/components/screens/OnboardingScreen'
import CricketIntroScreen from '@/components/screens/CricketIntroScreen'
import CricketCarouselScreen from '@/components/screens/CricketCarouselScreen'
import PhoneAuthScreen from '@/components/screens/PhoneAuthScreen'
import FeedbackButton from '@/components/FeedbackButton'
import ErrorBoundary from '@/components/ErrorBoundary'
import { analytics, getDeviceId } from '@/lib/analytics'

const clampTrust = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

const trustBandFor = (trust: number): 'low' | 'normal' | 'high' => {
  if (trust < 30) return 'low'
  if (trust < 60) return 'normal'
  return 'high'
}

const trustGuidanceFor = (trust: number, teamTrust?: number) => {
  const band = trustBandFor(trust)
  const teamLine = typeof teamTrust === 'number'
    ? ` Team Trust is ${teamTrust}/100; use it as the dressing-room climate, but keep this character's personal trust primary.`
    : ''
  if (band === 'low') {
    return `Trust band: LOW (<30). This overrides the character's usual warmth, nicknames, emoji habits, and teaching style. Output shape: under 22 words, one blunt line plus one terse question/challenge. No lists, tactical field/bowler details, multi-step advice, detailed coaching, private history, personal warmth, emojis, or "I noticed" language. If asked for advice, give only a surface-level instruction and imply they must earn deeper mentorship.${teamLine}`
  }
  if (band === 'high') {
    return `Trust band: HIGH (60+). Output shape: 3-5 sentences. Make it feel earned and personal. If story context exists, reference one specific past choice or pattern. Give the real advice you would hold back at low trust. You may show warmth, concern, teasing, or investment in your own character voice. End with a sharper follow-up question. Do not offer future preference unlocks yet.${teamLine}`
  }
  return `Trust band: NORMAL (30-60). Output shape: 2-3 sentences. Be professional and useful, but not intimate. Give one practical piece of advice. Avoid private history unless it is directly relevant. Avoid deep emotional warmth or vulnerability. End with one practical follow-up question.${teamLine}`
}

const defaultDmTrustFor = (world: GameState['world'], charId: CharId) => (
  world === 'cricket' ? (CRICKET_DM_TRUST_START[charId] ?? 50) : 50
)

const asArray = <T,>(value: T | T[] | null | undefined): T[] => {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('worlds')
  const [navHistory, setNavHistory] = useState<Screen[]>(['worlds'])
  const [dmChar, setDmChar] = useState<CharId | null>(null)
  const [dmTrust, setDmTrust] = useState<Record<string, number>>({})
  const [relationshipAlerts, setRelationshipAlerts] = useState<RelationshipAlert[]>([])
  const [impactNotif, setImpactNotif] = useState<ImpactNotif | null>(null)

  const showImpact = useCallback((n: ImpactNotif) => {
    setImpactNotif(n)
    setTimeout(() => setImpactNotif(null), 4000)
  }, [])
  // Per-character fame (drives follower counts on all profiles)
  const [charFame, setCharFame] = useState<Record<string, number>>({
    ria:85, kabir:55, dev:30, ananya:15, zoya:50
  })
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [dmBadgeCount, setDmBadgeCount] = useState(0)
  const clearDmBadge = useCallback(() => setDmBadgeCount(0), [])
  const [viewingCharId, setViewingCharId] = useState<CharId | null>(null)
  const [game, setGame] = useState<GameState>({
    playerName: '', playerGender: 'male' as const,
    world: 'creator-house' as const, char: null,
    situation: 0, situationQueue: [], choices: [],
    meters: { fame: 20, heat: 50, image: 30 },
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
  const dmTrustRef = useRef(dmTrust); dmTrustRef.current = dmTrust
  const charFameRef = useRef(charFame); charFameRef.current = charFame
  const likedPostsRef = useRef(likedPosts); likedPostsRef.current = likedPosts
  // Snapshot of all progress-extras to merge into every game_state write
  const extrasSnapshot = useCallback(() => ({
    dmTrust: dmTrustRef.current,
    charFame: charFameRef.current,
    likedPosts: [...likedPostsRef.current],
  }), [])

  // Hydrate all persisted progress after login/reload — game + relationships + likes
  const hydrateProgress = useCallback((s: GameState) => {
    setGame(s)
    if (s.dmTrust && Object.keys(s.dmTrust).length) setDmTrust(s.dmTrust)
    if (s.charFame && Object.keys(s.charFame).length) setCharFame(prev => ({ ...prev, ...s.charFame }))
    if (s.likedPosts && s.likedPosts.length) setLikedPosts(new Set(s.likedPosts))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(location.search).has('reset')) {
      resetGameState().finally(() => {
        window.history.replaceState(null, '', location.pathname)
        navigate('worlds', { replace: true })
        setReady(true)
      })
      return
    }
    // Nudge SW to pick up new deploy — silent, no user action needed
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.update()))
    }

    ;(async () => {
      try {
        const session = await ensureSession()
        if (!session) {
          navigate('phone-auth', { replace: true })
          setReady(true)
          return
        }
        const s = await loadGameState()
        hydrateProgress(s)
        navigate(s.playerName ? 'worlds' : 'onboarding', { replace: true })
      } catch {
        navigate('worlds', { replace: true })
      } finally {
        setReady(true)
      }
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }, [])

  const navigate = useCallback((to: Screen, opts?: { replace?: boolean }) => {
    const isDmRoute = to === 'dm-inbox' || to === 'dm-thread'
    if (isDmRoute && game.world !== 'cricket') {
      showToast('DMs are disabled for Creator House right now')
      return
    }
    setScreen(prev => {
      analytics.trackScreen(to, game.world ?? null, prev)
      return to
    })
    setNavHistory(prev => opts?.replace ? [...prev.slice(0, -1), to] : [...prev, to])
  }, [game.world, showToast])

  const handleAuthSuccess = useCallback(async () => {
    try {
      const s = await loadGameState()
      hydrateProgress(s)
      navigate(s.playerName ? 'worlds' : 'onboarding', { replace: true })
    } catch {
      navigate('worlds', { replace: true })
    }
  }, [navigate, hydrateProgress])

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

  const saveAndSet = useCallback((next: GameState) => {
    setGame(next)
    // Merge relationship/social progress so it persists with every write
    saveGameState({ ...next, ...extrasSnapshot() })
  }, [extrasSnapshot])

  const setChar = useCallback((id: CharId) => {
    saveAndSet({ ...game, char: id, situation: 0, choices: [], meters: charMeters(id), narrator_done: true, dayUnlockTime: {} })
  }, [saveAndSet, game])

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
    navigate('worlds')
  }, [game, navigate, extrasSnapshot])

  const startGame = useCallback(() => {
    showToast('Creator House is temporarily locked while we fix it 🔒')
    navigate('worlds')
  }, [navigate, showToast])

  const startCricketGame = useCallback(() => {
    // char:'player' sentinel — the player is themselves, not Hardik Pandya
    const newState: GameState = {
      playerName: game.playerName, playerGender: game.playerGender,
      world: 'cricket', char: 'player',
      situation: 0, situationQueue: buildCricketQueue(), choices: [],
      meters: { fame: 40, heat: 25, image: 20 },
      flags: DEFAULT_FLAGS, runMemory: {},
      narrator_done: true, dayUnlockTime: {},
    }
    setDmTrust({ ...CRICKET_DM_TRUST_START })
    setRelationshipAlerts([])
    saveAndSet(newState)
    analytics.track('world_entered', 'cricket', { world_id: 'cricket' })
    if (typeof window !== 'undefined') localStorage.setItem('lore_feed_seen', '1')
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

  const applyChoiceRelationshipEffects = useCallback((sit: { react?: { char: CharId } | null }, ch: NonNullable<typeof CRICKET_SITUATIONS[number]['choices'][number]>, previousMeters: GameState['meters'], nextMeters: GameState['meters']) => {
    if (game.world !== 'cricket') return
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

    const teamDelta = nextMeters.image - previousMeters.image
    const formDelta = nextMeters.fame - previousMeters.fame
    const fameDelta = nextMeters.heat - previousMeters.heat
    const leadership: CharId[] = ['hardik', 'rohit', 'mahela']
    const technical: CharId[] = ['rohit', 'bumrah', 'coach', 'mahela']
    const fameSensitive: CharId[] = ['hardik', 'rohit', 'mahela', 'bumrah']

    if (teamDelta !== 0) {
      const touchedDelta = teamDelta > 0
        ? Math.min(3, Math.ceil(teamDelta / 2))
        : Math.max(-3, Math.floor(teamDelta / 2))
      touched.forEach(id => add(id, touchedDelta))
      if (Math.abs(teamDelta) >= 2) leadership.forEach(id => add(id, teamDelta > 0 ? 1 : -1))
    }

    if (formDelta >= 2) {
      technical.forEach(id => { if (touched.has(id)) add(id, 1) })
    }
    if (fameDelta >= 2 && teamDelta < 0) {
      fameSensitive.forEach(id => add(id, -1))
    }
    if (fameDelta <= -1 && teamDelta > 0) {
      leadership.forEach(id => add(id, 1))
    }

    Object.entries(ch.relationshipDeltas ?? {}).forEach(([id, delta]) => {
      add(id as CharId, delta ?? 0)
    })

    Object.entries(deltas).forEach(([id, delta]) => adjustIndividualTrust(id as CharId, delta ?? 0))
  }, [adjustIndividualTrust, game.world])

  const advanceSituation = useCallback(() => {
    setGame(prev => {
      const nextIdx = prev.situation + 1
      const queue = prev.situationQueue

      // Day gate: look up next situation by ID
      const sitMap = prev.world === 'cricket'
        ? Object.fromEntries(CRICKET_SITUATIONS.map(s => [s.id, s]))
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
      saveGameState({ ...next, ...extrasSnapshot() })
      return next
    })
  }, [extrasSnapshot]) // functional update reads prev; extrasSnapshot is stable

  const makeChoice = useCallback(async (idx: number) => {
    // Look up current situation by ID from the queue (world-aware, index-shift-safe)
    const currentId = game.situationQueue[game.situation]
    const sitMap = game.world === 'cricket'
      ? Object.fromEntries(CRICKET_SITUATIONS.map(s => [s.id, s]))
      : Object.fromEntries(getVisibleSituations(game.meters, game.choices).map(s => [s.id, s]))
    const sit = sitMap[currentId]
    const ch = sit?.choices?.[idx]
    if (!ch) return
    const letter = idx === 0 ? 'A' : 'B'
    const newMeters = applyDeltas(game.meters, ch.deltas)
    const newFlags = applyFlagDeltas(game.flags, ch.flagDeltas)
    const newChoices = [...game.choices, letter] as ('A'|'B')[]
    // Write run memory if this is a match situation
    const newRunMemory = ch.runWrite
      ? { ...game.runMemory, [`${ch.runWrite}Runs`]: newMeters.fame, [`${ch.runWrite}Balls`]: undefined }
      : game.runMemory
    setGame(prev => ({ ...prev, meters: newMeters, flags: newFlags, choices: newChoices, runMemory: newRunMemory }))
    applyChoiceRelationshipEffects(sit, ch, game.meters, newMeters)
    analytics.track('choice_made', game.world, {
      situation_id: currentId,
      choice: letter,
      situation_index: game.situation,
      day: sit.day,
      fame_after: newMeters.fame,
      heat_after: newMeters.heat,
      image_after: newMeters.image,
    })
    await recordChoice(game.situation, letter)
  }, [applyChoiceRelationshipEffects, game])

  const openDMThread = useCallback(async (charId: CharId) => {
    if (game.world !== 'cricket') return
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
        const merged = [...msgs, ...onlyInMemory]
        if (merged.length > 0) setDmLastUpdated(times => ({ ...times, [charId]: times[charId] ?? Date.now() }))
        return { ...prev, [charId]: merged }
      })
    }
  }, [game.world, navigate])

  // ── DM cap helpers (localStorage-backed, 20 msgs → 6h lock) ─────────────
  const DM_CAP = 20
  const DM_LOCK_MS = 6 * 60 * 60 * 1000

  const getDmCapState = useCallback((cid: string) => {
    try {
      const raw = localStorage.getItem('lore_dm_cap')
      const all = raw ? JSON.parse(raw) : {}
      return (all[cid] ?? { count: 0, lockedUntil: 0 }) as { count: number; lockedUntil: number }
    } catch { return { count: 0, lockedUntil: 0 } }
  }, [])

  const setDmCapState = useCallback((cid: string, next: { count: number; lockedUntil: number }) => {
    try {
      const raw = localStorage.getItem('lore_dm_cap')
      const all = raw ? JSON.parse(raw) : {}
      localStorage.setItem('lore_dm_cap', JSON.stringify({ ...all, [cid]: next }))
    } catch {}
  }, [])

  // Build a brief narrative summary of the player's journey so far
  const buildStorySummary = useCallback(() => {
    if (game.world !== 'cricket' || game.choices.length === 0) return null
    const sitMap = Object.fromEntries(CRICKET_SITUATIONS.map(s => [s.id, s]))
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
    if (game.world !== 'cricket') return
    // Cap check — block if locked
    const capState = getDmCapState(charId)
    if (capState.lockedUntil > Date.now()) return

    const userMsg: DMMessage = { role: 'me', text }
    const contextHistory = [...(dmHistory[charId] ?? []), userMsg]
    setDmHistory(prev => ({ ...prev, [charId]: [...(prev[charId] ?? []), userMsg] }))
    setDmLastUpdated(prev => ({ ...prev, [charId]: Date.now() }))
    saveDM(charId, userMsg).catch(() => {})

    // Increment cap count; lock if limit hit
    const newCount = capState.count + 1
    if (newCount >= DM_CAP) {
      setDmCapState(charId, { count: newCount, lockedUntil: Date.now() + DM_LOCK_MS })
    } else {
      setDmCapState(charId, { count: newCount, lockedUntil: 0 })
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
      story: buildStorySummary() ?? undefined,
      trustWithChar: currentTrust,
      trustBand,
      trustGuidance: trustGuidanceFor(currentTrust, game.world === 'cricket' ? game.meters.image : undefined),
      teamTrust: game.world === 'cricket' ? game.meters.image : undefined,
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
    const mockArr = DM_MOCK[charId] ?? CRICKET_MOCK_FALLBACK[charId] ?? ['Haan yaar. Kya chal raha hai?', 'Interesting. Aur?', 'Hmm. Kya feel hua?']
    const reply = raw?.trim() || mockArr[Math.floor(Math.random() * mockArr.length)]
    const charMsg: DMMessage = { role: 'char', text: reply }
    setDmHistory(prev => ({ ...prev, [charId]: [...(prev[charId] ?? []), charMsg] }))
    setDmLastUpdated(prev => ({ ...prev, [charId]: Date.now() }))
    saveDM(charId, charMsg).catch(() => {})
    analytics.track('dm_sent', game.world, {
      char_id: charId,
      message_length: text.length,
      trust_before: currentTrust,
      trust_band: trustBand,
    })
    scoreTrustDelta(charId, text, reply, currentTrust).then(delta => {
      if (delta === 0) return
      adjustIndividualTrust(charId, delta)
    }).catch(() => {})
  }, [adjustIndividualTrust, dmHistory, game, dmTrust, getDmCapState, setDmCapState, buildStorySummary])

  // Like a post — updates player fame + target character's fame (idempotent: no double-like)
  const likePost = useCallback((postId: string, charId: CharId, fameDelta: number) => {
    if (likedPosts.has(postId)) return  // already liked — full no-op
    setLikedPosts(prev => { const n = new Set(prev); n.add(postId); return n })
    // In cricket, public Fame lives in the heat slot; Creator House uses fame slot
    const isCricket = game.world === 'cricket'
    const fameSlot = isCricket ? 'heat' : 'fame'
    const currentFameMeter = isCricket ? game.meters.heat : game.meters.fame
    const newFame = Math.min(100, currentFameMeter + Math.ceil(fameDelta / 3))
    setCharFame(prev => ({ ...prev, [charId]: Math.min(100, (prev[charId] ?? 50) + fameDelta) }))
    saveAndSet({ ...game, meters: { ...game.meters, [fameSlot]: newFame } })
    const allChars = game.world === 'cricket' ? { ...CHARS, ...CRICKET_CHARS } : CHARS
    const charName = allChars[charId]?.name
    const tasksTotal = game.situationQueue.length || (game.world === 'cricket' ? buildCricketQueue().length : SITUATIONS.length)
    showImpact({
      action: `Liked ${charName}'s post`,
      followerDelta: Math.round(fameDelta * 180),
      followerTotal: fameToFollowers(newFame),
      charId, charName,
      trustDelta: 3,
      trustVal: (dmTrust[charId] ?? 50) + 3,
      tasksLeft: Math.max(0, tasksTotal - game.situation - 1),
      tasksTotal,
    })
  }, [game, likedPosts, saveAndSet, dmTrust, showImpact])

  // Inject a DM message from a character without AI round-trip (used after Live choices)
  const injectCharDM = useCallback((charId: CharId, text: string) => {
    if (game.world !== 'cricket') return
    const charMsg: DMMessage = { role: 'char', text }
    setDmHistory(prev => ({ ...prev, [charId]: [...(prev[charId] ?? []), charMsg] }))
    setDmLastUpdated(prev => ({ ...prev, [charId]: Date.now() }))
    saveDM(charId, charMsg).catch(() => {})
    setDmBadgeCount(prev => prev + 1) // T4: badge notification
  }, [game.world])

  const applyFeedDeltas = useCallback((deltas: { fame: number; heat: number; image: number }, charId?: string, charName?: string) => {
    const isCricket = game.world === 'cricket'
    const nextMeters = {
      fame:  Math.max(0, Math.min(100, game.meters.fame + deltas.fame)),
      heat:  Math.max(0, Math.min(100, game.meters.heat + deltas.heat)),
      image: Math.max(0, Math.min(100, game.meters.image + deltas.image)),
    }
    const publicFame = isCricket ? nextMeters.heat : nextMeters.fame
    const publicFameDelta = isCricket ? deltas.heat : deltas.fame
    const teamTrustDelta = isCricket ? deltas.image : deltas.heat
    const teamTrustVal = isCricket ? nextMeters.image : nextMeters.heat
    const tasksTotal = game.situationQueue.length || (isCricket ? buildCricketQueue().length : SITUATIONS.length)
    saveAndSet({ ...game, meters: nextMeters })
    showImpact({
      action: charName ? `Commented on ${charName}'s post` : 'Commented',
      followerDelta: Math.round(publicFameDelta * 180),
      followerTotal: fameToFollowers(publicFame),
      charId, charName,
      trustDelta: teamTrustDelta,
      trustVal: teamTrustVal,
      tasksLeft: Math.max(0, tasksTotal - game.situation - 1),
      tasksTotal,
    })
  }, [game, saveAndSet, showImpact])

  const setViewingChar = useCallback((id: CharId | null) => {
    setViewingCharId(id)
    if (id) navigate('char-profile')
  }, [navigate])

  const resetGame = useCallback(async () => {
    await resetGameState()
    setGame({ playerName: '', playerGender: 'male' as const, world: 'creator-house', char: null, situation: 0, situationQueue: [], choices: [], meters: { fame: 20, heat: 50, image: 30 }, flags: DEFAULT_FLAGS, runMemory: {}, narrator_done: false, dayUnlockTime: {} })
    setDmHistory({})
    setDmLastUpdated({})
    setDmTrust({})
    setRelationshipAlerts([])
    navigate('worlds', { replace: true })
  }, [navigate])

  const prev = navHistory[navHistory.length - 2] ?? null

  if (!ready) return (
    <div className="stage">
      <div className="phone" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="pulse" style={{ width:16, height:16 }} />
      </div>
    </div>
  )

  return (
    <AppContext.Provider value={{
      screen, prevScreen: prev, dmChar, game, dmHistory, dmLastUpdated, dmTrust, relationshipAlerts, charFame, likedPosts, viewingCharId, toast, impactNotif, showImpact,
      dmBadgeCount, clearDmBadge,
      saveProfile,
      advanceSituation, navigate, goBack, showToast, setChar, startGame, startCricketGame,
      makeChoice, sendDM, openDMThread, resetGame, likePost, applyFeedDeltas, injectCharDM, setViewingChar,
    }}>
      <div className="stage">
        <div className="phone">
          <ErrorBoundary>
          <div className="viewport">
            <Slot id="phone-auth"    cur={screen} prev={prev}><PhoneAuthScreen onSuccess={handleAuthSuccess} /></Slot>
            <Slot id="onboarding"    cur={screen} prev={prev}><OnboardingScreen /></Slot>
            <Slot id="worlds"        cur={screen} prev={prev}><WorldsScreen /></Slot>
            <Slot id="world-intro"   cur={screen} prev={prev}><WorldIntroScreen /></Slot>
            <Slot id="cricket-intro"    cur={screen} prev={prev}><CricketIntroScreen /></Slot>
            <Slot id="cricket-carousel" cur={screen} prev={prev}><CricketCarouselScreen /></Slot>
            <Slot id="feed"        cur={screen} prev={prev}><FeedScreen /></Slot>
            <Slot id="narrator"    cur={screen} prev={prev}><NarratorScreen /></Slot>
            <Slot id="live"        cur={screen} prev={prev}><LiveScreen /></Slot>
            <Slot id="dm-inbox"    cur={screen} prev={prev}><DMInboxScreen /></Slot>
            <Slot id="dm-thread"   cur={screen} prev={prev}><DMThreadScreen /></Slot>
            <Slot id="profile"     cur={screen} prev={prev}><ProfileScreen /></Slot>
            <Slot id="char-profile" cur={screen} prev={prev}><CharProfileScreen /></Slot>
          </div>
          </ErrorBoundary>
          {/* Feedback button — only visible at ?dev=1 */}
          <FeedbackButton />
        </div>
      </div>
    </AppContext.Provider>
  )
}

function Slot({ id, cur, prev, children }: { id: Screen; cur: Screen; prev: Screen | null; children: React.ReactNode }) {
  const cls = cur === id ? 'screen active' : prev === id ? 'screen behind' : 'screen'
  return <section className={cls} id={`s-${id}`}>{children}</section>
}
