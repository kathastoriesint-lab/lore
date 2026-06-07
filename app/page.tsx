'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CharId, DMMessage, GameState, Screen } from '@/lib/types'
import { AppContext, ImpactNotif } from '@/lib/context'
import {
  applyDeltas, applyFlagDeltas, charMeters, ensureSession, getAIReply, scoreTrustDelta,
  loadDMs, loadGameState, recordChoice, resetGameState, saveDM, saveGameState,
  fameToFollowers, DEFAULT_FLAGS, buildCricketQueue, buildCHQueue,
} from '@/lib/game'
import { CHARS, SITUATIONS, DM_MOCK, getVisibleSituations } from '@/lib/data'
import { CRICKET_SITUATIONS } from '@/lib/cricket-data'
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
import FeedbackButton from '@/components/FeedbackButton'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function App() {
  const [screen, setScreen] = useState<Screen>('worlds')
  const [navHistory, setNavHistory] = useState<Screen[]>(['worlds'])
  const [phone, setPhone] = useState('')
  const [dmChar, setDmChar] = useState<CharId | null>(null)
  const [dmTrust, setDmTrust] = useState<Record<string, number>>({})
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

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(location.search).has('reset')) {
      resetGameState().finally(() => {
        window.history.replaceState(null, '', location.pathname)
        navigate('worlds', { replace: true })
        setReady(true)
      })
      return
    }
    // Anonymous session — no login required
    ensureSession()
      .then(() => loadGameState())
      .then(s => {
        setGame(s)
        navigate(s.playerName ? 'worlds' : 'onboarding', { replace: true })
        setReady(true)
      })
      .catch(() => {
        navigate('worlds', { replace: true })
        setReady(true)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = useCallback((to: Screen, opts?: { replace?: boolean }) => {
    setScreen(to)
    setNavHistory(prev => opts?.replace ? [...prev.slice(0, -1), to] : [...prev, to])
  }, [])

  const goBack = useCallback(() => {
    setNavHistory(prev => {
      if (prev.length <= 1) return prev
      const next = prev.slice(0, -1)
      setScreen(next[next.length - 1])
      return next
    })
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }, [])

  const saveAndSet = useCallback((next: GameState) => {
    setGame(next)
    saveGameState(next)
  }, [])

  const setChar = useCallback((id: CharId) => {
    saveAndSet({ ...game, char: id, situation: 0, choices: [], meters: charMeters(id), narrator_done: true, dayUnlockTime: {} })
  }, [saveAndSet, game])

  const saveProfile = useCallback(async (name: string, gender: 'male' | 'female', avatarUrl?: string) => {
    const updated: GameState = { ...game, playerName: name, playerGender: gender, avatarUrl }
    setGame(updated)
    await saveGameState(updated)
    // Expose a setter on window so the async avatar generator can update without re-rendering onboarding
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).__lore_set_avatar = (url: string) => {
        setGame(prev => {
          const next = { ...prev, avatarUrl: url }
          saveGameState(next).catch(() => {})
          return next
        })
      }
    }
    navigate('worlds')
  }, [game, navigate])

  const startGame = useCallback(() => {
    const meters = { fame: 20, heat: 50, image: 30 }
    const choices: ('A'|'B')[] = []
    const newState: GameState = {
      playerName: game.playerName, playerGender: game.playerGender,
      world: 'creator-house', char: 'kabir',
      situation: 0, situationQueue: buildCHQueue(meters, choices), choices,
      meters, flags: DEFAULT_FLAGS, runMemory: {},
      narrator_done: true, dayUnlockTime: {},
    }
    saveAndSet(newState)
    if (typeof window !== 'undefined') localStorage.setItem('lore_feed_seen', '1')
    navigate('live')
  }, [game.playerName, game.playerGender, saveAndSet, navigate])

  const startCricketGame = useCallback(() => {
    // char:'player' sentinel — the player is themselves, not Hardik Pandya
    const newState: GameState = {
      playerName: game.playerName, playerGender: game.playerGender,
      world: 'cricket', char: 'player',
      situation: 0, situationQueue: buildCricketQueue(), choices: [],
      meters: { fame: 45, heat: 55, image: 35 },
      flags: DEFAULT_FLAGS, runMemory: {},
      narrator_done: true, dayUnlockTime: {},
    }
    saveAndSet(newState)
    if (typeof window !== 'undefined') localStorage.setItem('lore_feed_seen', '1')
    navigate('live')
  }, [game.playerName, game.playerGender, saveAndSet, navigate])

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
      // Day gate: 15 minutes between days
      const gateMs = 15 * 60 * 1000
      if (nextSit && currentSit && nextSit.day > currentSit.day && !newUnlockTime[nextSit.day]) {
        newUnlockTime[nextSit.day] = Date.now() + gateMs
      }
      const next = { ...prev, situation: nextIdx, situationQueue: queue, dayUnlockTime: newUnlockTime }
      saveGameState(next)
      return next
    })
  }, []) // no deps — functional update reads prev directly

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
    await recordChoice(game.situation, letter)
  }, [game])

  const openDMThread = useCallback(async (charId: CharId) => {
    setDmChar(charId)
    navigate('dm-thread')
    setDmBadgeCount(0) // clear badge on open
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
  }, [navigate])

  const sendDM = useCallback(async (charId: CharId, text: string) => {
    const userMsg: DMMessage = { role: 'me', text }
    const contextHistory = [...(dmHistory[charId] ?? []), userMsg]
    setDmHistory(prev => ({ ...prev, [charId]: [...(prev[charId] ?? []), userMsg] }))
    setDmLastUpdated(prev => ({ ...prev, [charId]: Date.now() }))
    saveDM(charId, userMsg).catch(() => {})
    const playerName = game.playerName || 'Yaar'
    const raw = await getAIReply(charId, contextHistory, playerName, {
      char: game.char, meters: game.meters, choices: game.choices, situation: game.situation, world: game.world,
    })
    const CRICKET_MOCK_FALLBACK: Partial<Record<string, string[]>> = {
      hardik: ['Role pe focus rakh.', 'Execution dikhao.', 'Theek hai. Kal dekhte hain.'],
      rohit:  ['Tempo samajh raha hai?', 'Hmm.', 'Process pe raho.'],
      surya:  ['Champion! Field dekh pehle 😄', 'Energy mast hai. Ball bhi dekh.', 'Aaja kal nets mein.'],
      bumrah: ['Wrist pehle pick karo.', 'Better. Still early.', 'Kal over milega.'],
      tilak:  ['Good. Repeat karo.', 'Process pe raho.', 'Hota hai. Seekhte hain.'],
      coach:  ['Video bhej.', 'Kal subah 6 baje. Throwdowns.', '10 minute rona allowed. Phir bat uthao.'],
      friend: ['BHAI REPLY KAR 😭', 'Tu theek hai? Genuinely pooch raha hoon.', 'Main hoon yaar. Baat kar.'],
    }
    const mockArr = DM_MOCK[charId] ?? CRICKET_MOCK_FALLBACK[charId] ?? ['Haan yaar.', 'Kya chal raha hai?', 'Interesting.']
    const reply = raw?.trim() || mockArr[Math.floor(Math.random() * mockArr.length)]
    const charMsg: DMMessage = { role: 'char', text: reply }
    setDmHistory(prev => ({ ...prev, [charId]: [...(prev[charId] ?? []), charMsg] }))
    setDmLastUpdated(prev => ({ ...prev, [charId]: Date.now() }))
    saveDM(charId, charMsg).catch(() => {})
    // Score trust impact in background — LLM evaluates the exchange
    scoreTrustDelta(charId, text, reply).then(delta => {
      if (delta === 0) return
      setDmTrust(prev => {
        const base = prev[charId] ?? 50
        const next = Math.max(0, Math.min(100, base + delta))
        return { ...prev, [charId]: next }
      })
    }).catch(() => {})
  }, [dmHistory, game.char, game.playerName])

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
    const charName = CHARS[charId]?.name
    showImpact({
      action: `Liked ${charName}'s post`,
      followerDelta: Math.round(fameDelta * 180),
      followerTotal: fameToFollowers(newFame),
      charId, charName,
      trustDelta: 3,
      trustVal: (dmTrust[charId] ?? 50) + 3,
      tasksLeft: Math.max(0, SITUATIONS.length - game.situation - 1),
      tasksTotal: SITUATIONS.length,
    })
  }, [game, likedPosts, saveAndSet, dmTrust, showImpact])

  // Inject a DM message from a character without AI round-trip (used after Live choices)
  const injectCharDM = useCallback((charId: CharId, text: string) => {
    const charMsg: DMMessage = { role: 'char', text }
    setDmHistory(prev => ({ ...prev, [charId]: [...(prev[charId] ?? []), charMsg] }))
    setDmLastUpdated(prev => ({ ...prev, [charId]: Date.now() }))
    saveDM(charId, charMsg).catch(() => {})
    setDmBadgeCount(prev => prev + 1) // T4: badge notification
  }, [])

  const applyFeedDeltas = useCallback((deltas: { fame: number; heat: number; image: number }, charId?: string, charName?: string) => {
    const newFame = Math.max(0, Math.min(100, game.meters.fame + deltas.fame))
    saveAndSet({ ...game, meters: {
      fame:  newFame,
      heat:  Math.max(0, Math.min(100, game.meters.heat  + deltas.heat)),
      image: Math.max(0, Math.min(100, game.meters.image + deltas.image)),
    }})
    showImpact({
      action: charName ? `Commented on ${charName}'s post` : 'Commented',
      followerDelta: Math.round(deltas.fame * 180),
      followerTotal: fameToFollowers(newFame),
      charId, charName,
      trustDelta: deltas.heat,
      trustVal: game.meters.heat + deltas.heat,
      tasksLeft: Math.max(0, SITUATIONS.length - game.situation - 1),
      tasksTotal: SITUATIONS.length,
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
      screen, prevScreen: prev, dmChar, game, dmHistory, dmLastUpdated, dmTrust, charFame, likedPosts, viewingCharId, toast, impactNotif, showImpact,
      dmBadgeCount, clearDmBadge,
      phone, setPhone, saveProfile,
      advanceSituation, navigate, goBack, showToast, setChar, startGame, startCricketGame,
      makeChoice, sendDM, openDMThread, resetGame, likePost, applyFeedDeltas, injectCharDM, setViewingChar,
    }}>
      <div className="stage">
        <div className="phone">
          <ErrorBoundary>
          <div className="viewport">
            <Slot id="onboarding"    cur={screen} prev={prev}><OnboardingScreen /></Slot>
            <Slot id="worlds"        cur={screen} prev={prev}><WorldsScreen /></Slot>
            <Slot id="world-intro"   cur={screen} prev={prev}><WorldIntroScreen /></Slot>
            <Slot id="cricket-intro" cur={screen} prev={prev}><CricketIntroScreen /></Slot>
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
