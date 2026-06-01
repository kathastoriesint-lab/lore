'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CharId, DMMessage, GameState, Screen } from '@/lib/types'
import { AppContext, ImpactNotif } from '@/lib/context'
import {
  applyDeltas, charMeters, ensureSession, getAIReply, scoreTrustDelta,
  loadDMs, loadGameState, recordChoice, resetGameState, saveDM, saveGameState,
} from '@/lib/game'
import { CHARS, SITUATIONS, DM_MOCK } from '@/lib/data'
import WorldsScreen from '@/components/screens/WorldsScreen'
import WorldIntroScreen from '@/components/screens/WorldIntroScreen'
import FeedScreen from '@/components/screens/FeedScreen'
import NarratorScreen from '@/components/screens/NarratorScreen'
import LiveScreen from '@/components/screens/LiveScreen'
import DMInboxScreen from '@/components/screens/DMInboxScreen'
import DMThreadScreen from '@/components/screens/DMThreadScreen'
import ProfileScreen from '@/components/screens/ProfileScreen'
import CharProfileScreen from '@/components/screens/CharProfileScreen'
import ImpactPill from '@/components/ImpactPill'

export default function App() {
  const [screen, setScreen] = useState<Screen>('worlds')
  const [navHistory, setNavHistory] = useState<Screen[]>(['worlds'])
  const [dmChar, setDmChar] = useState<CharId | null>(null)
  const [dmTrust, setDmTrust] = useState<Record<string, number>>({})
  const [impactNotif, setImpactNotif] = useState<ImpactNotif | null>(null)

  const fameToFollowers = (fame: number) => Math.round(fame * fame * 120 + fame * 1000)

  const showImpact = useCallback((n: ImpactNotif) => {
    setImpactNotif(n)
    setTimeout(() => setImpactNotif(null), 4000)
  }, [])
  // Per-character fame (drives follower counts on all profiles)
  const [charFame, setCharFame] = useState<Record<string, number>>({
    reya:85, kabir:55, meher:40, dev:30, ananya:15, zoya:50, rishi:35, adi:25
  })
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [viewingCharId, setViewingCharId] = useState<CharId | null>(null)
  const [game, setGame] = useState<GameState>({
    char: null, situation: 0, choices: [], meters: { fame: 15, trust: 60, heat: 5 }, narrator_done: false, dayUnlockTime: {},
  })
  const [dmHistory, setDmHistory] = useState<Record<string, DMMessage[]>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(location.search).has('reset')) {
      resetGameState().finally(() => {
        window.history.replaceState(null, '', location.pathname)
        setReady(true)
      })
      return
    }
    ensureSession()
      .then(() => loadGameState())
      .then(s => { setGame(s); setReady(true) })
      .catch(() => setReady(true))
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
    saveAndSet({ char: id, situation: 0, choices: [], meters: charMeters(id), narrator_done: true, dayUnlockTime: {} })
  }, [saveAndSet])

  const advanceSituation = useCallback(() => {
    const visibleSits = SITUATIONS.filter(s =>
      !s.chars || (game.char && s.chars.includes(game.char!))
    )
    const currentSit = visibleSits[game.situation]
    const nextSit = visibleSits[game.situation + 1]
    const newUnlockTime = { ...game.dayUnlockTime }
    // 6-hour gate on day boundary (demo: set LORE_DAY_GATE_MS=1800000 for 30min)
    const gateMs = 6 * 60 * 60 * 1000
    if (nextSit && currentSit && nextSit.day > currentSit.day && !newUnlockTime[nextSit.day]) {
      newUnlockTime[nextSit.day] = Date.now() + gateMs
    }
    saveAndSet({ ...game, situation: game.situation + 1, dayUnlockTime: newUnlockTime })
  }, [game, saveAndSet])

  const makeChoice = useCallback(async (idx: number) => {
    if (!game.char) return
    const visibleSits = SITUATIONS.filter(s => !s.chars || s.chars.includes(game.char!))
    const sit = visibleSits[game.situation]
    const ch = (sit?.choicesByChar?.[game.char!] ?? sit?.choices)?.[idx]
    if (!ch) return
    const letter = idx === 0 ? 'A' : 'B'
    const newMeters = applyDeltas(game.meters, ch.deltas)
    saveAndSet({ ...game, meters: newMeters, choices: [...game.choices, letter] as ('A'|'B')[] })
    await recordChoice(game.situation, letter)
    // Show impact pill after live choice
    const firstReactor = ch.reactions.find(r => r.char !== '__fan')
    showImpact({
      action: `Made a choice: ${ch.t.slice(0, 30)}`,
      followerDelta: Math.round(ch.deltas.fame * 180),
      followerTotal: fameToFollowers(newMeters.fame),
      charId: firstReactor?.char,
      charName: firstReactor ? CHARS[firstReactor.char as CharId]?.name : undefined,
      trustDelta: ch.deltas.trust,
      trustVal: newMeters.trust,
      tasksLeft: Math.max(0, SITUATIONS.length - game.situation - 2),
      tasksTotal: SITUATIONS.length,
    })
  }, [game, saveAndSet, showImpact])

  const openDMThread = useCallback(async (charId: CharId) => {
    setDmChar(charId)
    navigate('dm-thread')
    if (!dmHistory[charId]) {
      const msgs = await loadDMs(charId)
      setDmHistory(prev => ({ ...prev, [charId]: msgs }))
    }
  }, [dmHistory, navigate])

  const sendDM = useCallback(async (charId: CharId, text: string) => {
    const userMsg: DMMessage = { role: 'me', text }
    const contextHistory = [...(dmHistory[charId] ?? []), userMsg]
    setDmHistory(prev => ({ ...prev, [charId]: [...(prev[charId] ?? []), userMsg] }))
    saveDM(charId, userMsg).catch(() => {})
    const playerName = game.char ? CHARS[game.char].name : 'Yaar'
    const raw = await getAIReply(charId, contextHistory, playerName)
    const reply = raw?.trim() || DM_MOCK[charId][Math.floor(Math.random() * DM_MOCK[charId].length)]
    const charMsg: DMMessage = { role: 'char', text: reply }
    setDmHistory(prev => ({ ...prev, [charId]: [...(prev[charId] ?? []), charMsg] }))
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
  }, [dmHistory, game.char])

  // Like a post — updates player fame + target character's fame
  const likePost = useCallback((postId: string, charId: CharId, fameDelta: number) => {
    setLikedPosts(prev => { const n = new Set(prev); n.add(postId); return n })
    const newFame = Math.min(100, game.meters.fame + Math.ceil(fameDelta / 3))
    setCharFame(prev => ({ ...prev, [charId]: Math.min(100, (prev[charId] ?? 50) + fameDelta) }))
    saveAndSet({ ...game, meters: { ...game.meters, fame: newFame } })
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
  }, [game, saveAndSet, dmTrust, showImpact])

  // Inject a DM message from a character without AI round-trip (used after Live choices)
  const injectCharDM = useCallback((charId: CharId, text: string) => {
    const charMsg: DMMessage = { role: 'char', text }
    setDmHistory(prev => ({ ...prev, [charId]: [...(prev[charId] ?? []), charMsg] }))
    saveDM(charId, charMsg).catch(() => {})
  }, [])

  const applyFeedDeltas = useCallback((deltas: { fame: number; trust: number; heat: number }, charId?: string, charName?: string) => {
    const newFame = Math.max(0, Math.min(100, game.meters.fame + deltas.fame))
    saveAndSet({ ...game, meters: {
      fame:  newFame,
      trust: Math.max(0, Math.min(100, game.meters.trust + deltas.trust)),
      heat:  Math.max(0, Math.min(100, game.meters.heat  + deltas.heat)),
    }})
    showImpact({
      action: charName ? `Commented on ${charName}'s post` : 'Commented',
      followerDelta: Math.round(deltas.fame * 180),
      followerTotal: fameToFollowers(newFame),
      charId, charName,
      trustDelta: deltas.trust,
      trustVal: game.meters.trust + deltas.trust,
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
    setGame({ char: null, situation: 0, choices: [], meters: { fame: 15, trust: 60, heat: 5 }, narrator_done: false, dayUnlockTime: {} })
    setDmHistory({})
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
      screen, prevScreen: prev, dmChar, game, dmHistory, dmTrust, charFame, likedPosts, viewingCharId, toast, impactNotif, showImpact,
      advanceSituation, navigate, goBack, showToast, setChar,
      makeChoice, sendDM, openDMThread, resetGame, likePost, applyFeedDeltas, injectCharDM, setViewingChar,
    }}>
      <div className="stage">
        <div className="phone">
          {/* Global impact pill — floats over all screens */}
          {impactNotif && (
            <div className="impact-pill-layer">
              <ImpactPill notif={impactNotif} key={impactNotif.action + impactNotif.followerDelta} />
            </div>
          )}
          <div className="viewport">
            <Slot id="worlds"      cur={screen} prev={prev}><WorldsScreen /></Slot>
            <Slot id="world-intro" cur={screen} prev={prev}><WorldIntroScreen /></Slot>
            <Slot id="feed"        cur={screen} prev={prev}><FeedScreen /></Slot>
            <Slot id="narrator"    cur={screen} prev={prev}><NarratorScreen /></Slot>
            <Slot id="live"        cur={screen} prev={prev}><LiveScreen /></Slot>
            <Slot id="dm-inbox"    cur={screen} prev={prev}><DMInboxScreen /></Slot>
            <Slot id="dm-thread"   cur={screen} prev={prev}><DMThreadScreen /></Slot>
            <Slot id="profile"     cur={screen} prev={prev}><ProfileScreen /></Slot>
            <Slot id="char-profile" cur={screen} prev={prev}><CharProfileScreen /></Slot>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  )
}

function Slot({ id, cur, prev, children }: { id: Screen; cur: Screen; prev: Screen | null; children: React.ReactNode }) {
  const cls = cur === id ? 'screen active' : prev === id ? 'screen behind' : 'screen'
  return <section className={cls} id={`s-${id}`}>{children}</section>
}
