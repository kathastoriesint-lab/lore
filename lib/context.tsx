'use client'
import { createContext, useContext } from 'react'
import type { CharId, DMMessage, GameState, Screen } from './types'

export interface ImpactNotif {
  action: string           // "Liked Reya's post"
  followerDelta: number    // +2400
  followerTotal: number    // 18400
  charId?: string          // 'reya'
  charName?: string        // 'Reya'
  trustDelta?: number      // +3
  trustVal?: number        // 43
  tasksLeft?: number       // 4
  tasksTotal?: number      // 6
}

export interface AppCtx {
  screen: Screen
  prevScreen: Screen | null
  dmChar: CharId | null
  game: GameState
  dmHistory: Record<string, DMMessage[]>
  dmTrust: Record<string, number>
  impactNotif: ImpactNotif | null
  showImpact: (n: ImpactNotif) => void
  charFame: Record<string, number>
  likedPosts: Set<string>
  toast: string | null
  viewingCharId: CharId | null
  likePost: (postId: string, charId: CharId, fameDelta: number) => void
  applyFeedDeltas: (deltas: { fame: number; trust: number; heat: number }, charId?: string, charName?: string) => void
  injectCharDM: (charId: CharId, text: string) => void
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
