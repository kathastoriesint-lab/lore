'use client'
import { createContext, useContext } from 'react'
import type { CharId, DMMessage, GameState, Screen } from './types'

export interface AppCtx {
  screen: Screen
  prevScreen: Screen | null
  dmChar: CharId | null
  game: GameState
  dmHistory: Record<string, DMMessage[]>
  dmTrust: Record<string, number>
  charFame: Record<string, number>
  likedPosts: Set<string>
  toast: string | null
  viewingCharId: CharId | null
  likePost: (postId: string, charId: CharId, fameDelta: number) => void
  applyFeedDeltas: (deltas: { fame: number; trust: number; heat: number }) => void
  setViewingChar: (id: CharId | null) => void
  advanceSituation: () => void
  navigate: (s: Screen, opts?: { replace?: boolean }) => void
  goBack: () => void
  showToast: (msg: string) => void
  setChar: (id: CharId) => void
  makeChoice: (idx: number) => Promise<void>
  sendDM: (charId: CharId, text: string) => Promise<void>
  openDMThread: (charId: CharId) => void
  resetGame: () => Promise<void>
}

export const AppContext = createContext<AppCtx>(null!)
export const useApp = () => useContext(AppContext)
