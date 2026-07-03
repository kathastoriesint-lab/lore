'use client'
import { createContext, useContext } from 'react'
import type { AiPost, CharId, DMMessage, GameState, Screen } from './types'
import type { DMTimeMeta } from './dm-time'

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
  // ── Live "make a post" (gpt-4o) ──────────────────────────────────────────
  /** Key of the freshly-posted player post the feed should stream in, or null. */
  pendingPostReveal: string | null
  setPendingPostReveal: (key: string | null) => void
  /** Create/merge an AI post (caption + reactions) keyed by `${sit.id}-${letter}`. */
  upsertAiPost: (key: string, patch: Partial<AiPost>) => void
  /** Transient DM notification banner (app-wide), shown when the world DMs you. */
  dmNotif: { id: string; name: string; cls: string } | null
  /** Inject a character DM AND raise the app-wide notification banner. */
  notifyDM: (charId: CharId, text: string, embed?: DMMessage['embed'], meta?: DMTimeMeta) => void
  /** Transient "+N followers" receipt pill shown on the feed during a reveal. */
  followerReceipt: { delta: number } | null
  showFollowerReceipt: (delta: number) => void
  /** Drives the HUD follower count-up + delta chip during an in-feed reaction. */
  hudReaction: { base: number; gain: number; key: string } | null
  setHudReaction: (r: { base: number; gain: number; key: string } | null) => void
  applyFeedDeltas: (deltas: Partial<{ form: number; fame: number; trust: number }>, charId?: string, charName?: string, relationshipDeltas?: Partial<Record<string, number>>) => void
  injectCharDM: (charId: CharId, text: string, embed?: DMMessage['embed'], meta?: DMTimeMeta) => void
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
  /** Resolve the pending squad selection: persist the verdict + advance the week. */
  resolveSelection: () => void
  /** Apply a nets Form gain and consume one of the interlude's net sessions. */
  completeNetSession: (formGain: number) => void
  /** Play out an authored trust moment in a DM thread (once per interlude). */
  /** Story-chat session (choice → DM): which thread is scoped + replies sent. */
  dmStorySession: { char: CharId; sent: number } | null
  /** Begin a scoped story chat when a choice routes into a DM. */
  startDmStorySession: (char: CharId) => void
  /** Earn-a-skip: clear the match-calendar wait once the engagement slate is done. */
  skipWeekWait: () => void
  /** Close the current eviction ceremony — mark evicted, clear pending. */
  resolveEviction: () => void
}

export const AppContext = createContext<AppCtx>(null!)
export const useApp = () => useContext(AppContext)
