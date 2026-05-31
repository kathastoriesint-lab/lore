'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CharId, DMMessage, GameState, Screen } from '@/lib/types'
import { AppContext } from '@/lib/context'
import {
  applyDeltas, charMeters, ensureSession, getAIReply,
  loadDMs, loadGameState, recordChoice, resetGameState, saveDM, saveGameState,
} from '@/lib/game'
import { CHARS, SITUATIONS, DM_MOCK } from '@/lib/data'
import WorldsScreen from '@/components/screens/WorldsScreen'
import FeedScreen from '@/components/screens/FeedScreen'
import NarratorScreen from '@/components/screens/NarratorScreen'
import LiveScreen from '@/components/screens/LiveScreen'
import DMInboxScreen from '@/components/screens/DMInboxScreen'
import DMThreadScreen from '@/components/screens/DMThreadScreen'

export default function App() {
  const [screen, setScreen] = useState<Screen>('worlds')
  const [navHistory, setNavHistory] = useState<Screen[]>(['worlds'])
  const [dmChar, setDmChar] = useState<CharId | null>(null)
  const [game, setGame] = useState<GameState>({
    char: null, situation: 0, choices: [], meters: { fame: 15, trust: 60, heat: 5 }, narrator_done: false,
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
    saveAndSet({ char: id, situation: 0, choices: [], meters: charMeters(id), narrator_done: true })
  }, [saveAndSet])

  const advanceSituation = useCallback(() => {
    saveAndSet({ ...game, situation: game.situation + 1 })
  }, [game, saveAndSet])

  const makeChoice = useCallback(async (idx: number) => {
    if (!game.char) return
    const ch = SITUATIONS[game.situation].choices[idx]
    const letter = idx === 0 ? 'A' : 'B'
    saveAndSet({ ...game, meters: applyDeltas(game.meters, ch.deltas), choices: [...game.choices, letter] as ('A'|'B')[] })
    await recordChoice(game.situation, letter)
  }, [game, saveAndSet])

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
    const updated = [...(dmHistory[charId] ?? []), userMsg]
    setDmHistory(prev => ({ ...prev, [charId]: updated }))
    await saveDM(charId, userMsg)
    const playerName = game.char ? CHARS[game.char].name : 'Yaar'
    const raw = await getAIReply(charId, updated, playerName)
    const reply = raw?.trim() || DM_MOCK[charId][Math.floor(Math.random() * DM_MOCK[charId].length)]
    const charMsg: DMMessage = { role: 'char', text: reply }
    setDmHistory(prev => ({ ...prev, [charId]: [...(prev[charId] ?? []), charMsg] }))
    await saveDM(charId, charMsg)
  }, [dmHistory, game.char])

  const resetGame = useCallback(async () => {
    await resetGameState()
    setGame({ char: null, situation: 0, choices: [], meters: { fame: 15, trust: 60, heat: 5 }, narrator_done: false })
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
      screen, prevScreen: prev, dmChar, game, dmHistory, toast,
      advanceSituation, navigate, goBack, showToast, setChar,
      makeChoice, sendDM, openDMThread, resetGame,
    }}>
      <div className="stage">
        <div className="phone">
          <div className="viewport">
            <Slot id="worlds"    cur={screen} prev={prev}><WorldsScreen /></Slot>
            <Slot id="feed"      cur={screen} prev={prev}><FeedScreen /></Slot>
            <Slot id="narrator"  cur={screen} prev={prev}><NarratorScreen /></Slot>
            <Slot id="live"      cur={screen} prev={prev}><LiveScreen /></Slot>
            <Slot id="dm-inbox"  cur={screen} prev={prev}><DMInboxScreen /></Slot>
            <Slot id="dm-thread" cur={screen} prev={prev}><DMThreadScreen /></Slot>
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
