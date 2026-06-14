'use client'
import { createContext, useContext } from 'react'
import type { CharId, DMMessage, GameState, Screen } from './types'

export interface ImpactNotif {
  action: string           // "Liked Ria's post"
  followerDelta: number    // +2400
  followerTotal: number    // 18400
  charId?: string          // 'ria'
  charName?: string        // 'Ria'
  trustDelta?: number      // +3
  trustVal?: number        // 43
  tasksLeft?: number       // 4
  tasksTotal?: number      // 6
}

export interface RelationshipAlert {
  id: string
  charId: CharId
  handle: string
  caption: string
  createdAt: number
}

export interface AppCtx {
  screen: Screen
  prevScreen: Screen | null
  dmChar: CharId | null
  game: GameState
  dmHistory: Record<string, DMMessage[]>
  dmLastUpdated: Record<string, number>
  dmTrust: Record<string, number>
  relationshipAlerts: RelationshipAlert[]
  impactNotif: ImpactNotif | null
  showImpact: (n: ImpactNotif) => void
  charFame: Record<string, number>
  likedPosts: Set<string>
  toast: string | null
  viewingCharId: CharId | null
  dmBadgeCount: number
  clearDmBadge: () => void
  likePost: (postId: string, charId: CharId, fameDelta: number) => void
  applyFeedDeltas: (deltas: { fame: number; heat: number; image: number }, charId?: string, charName?: string) => void
  injectCharDM: (charId: CharId, text: string) => void
  setViewingChar: (id: CharId | null) => void
  advanceSituation: () => void
  navigate: (s: Screen, opts?: { replace?: boolean }) => void
  goBack: () => void
  showToast: (msg: string) => void
  saveProfile: (name: string, gender: 'male' | 'female', avatarUrl?: string) => Promise<void>
  setChar: (id: CharId) => void
  startGame: () => void
  startCricketGame: () => void
  makeChoice: (idx: number) => Promise<void>
  sendDM: (charId: CharId, text: string) => Promise<void>
  openDMThread: (charId: CharId) => void
  resetGame: () => Promise<void>
  /** Close the current interlude and open the next week (success/fail variant). */
  resolveInterlude: (variant: 'success' | 'fail') => void
  /** Week 7 hard gate: expiry below gate restarts a fresh interlude (clock + caps). */
  restartInterlude: () => void
  /** Apply a nets Form gain and consume one of the interlude's net sessions. */
  completeNetSession: (formGain: number) => void
  /** Play out an authored trust moment in a DM thread (once per interlude). */
  completeTrustMoment: (charId: CharId, opener: string, reply: string, response: string, delta: number) => void
  /** Close the current eviction ceremony — mark evicted, clear pending. */
  resolveEviction: () => void
}

export const AppContext = createContext<AppCtx>(null!)
export const useApp = () => useContext(AppContext)
