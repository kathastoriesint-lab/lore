'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

type PlayState = 'loading' | 'playing' | 'paused' | 'idle' | 'blocked' | 'error'

interface Props {
  text: string
  /** True when the parent screen is currently visible to the user */
  active: boolean
  /** Increment to force-pause the audio (e.g., when user makes a choice) */
  pauseSignal?: number
}

export default function NarrationButton({ text, active, pauseSignal }: Props) {
  const [state, setState] = useState<PlayState>('loading')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)
  const activeRef = useRef(active)

  const cleanup = useCallback(() => {
    audioRef.current?.pause()
    audioRef.current = null
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [])

  // Load audio when text changes. Auto-play ONLY if currently active.
  useEffect(() => {
    let cancelled = false
    cleanup()
    setState('loading')

    ;(async () => {
      try {
        const res = await fetch('/api/narrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        if (cancelled) return
        const blob = await res.blob()
        if (cancelled) return
        const url = URL.createObjectURL(blob)
        blobUrlRef.current = url
        const audio = new Audio(url)
        audio.addEventListener('ended', () => setState('idle'))
        audio.addEventListener('error', () => setState('error'))
        audioRef.current = audio

        // Auto-play only if the parent screen is currently active
        if (cancelled) return
        if (activeRef.current) {
          try {
            await audio.play()
            if (!cancelled) setState('playing')
          } catch {
            if (!cancelled) setState('blocked')
          }
        } else {
          if (!cancelled) setState('paused')
        }
      } catch (e) {
        if (!cancelled) {
          setState('error')
          console.error('narrate error:', e)
        }
      }
    })()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [text, cleanup])

  // React to active toggling: pause on leaving, autoplay on first arrival
  useEffect(() => {
    activeRef.current = active
    const a = audioRef.current
    if (!a) return

    if (active) {
      // Only auto-play if audio is fresh (never started yet for this text)
      if (a.paused && a.currentTime === 0) {
        a.play()
          .then(() => setState('playing'))
          .catch(() => setState('blocked'))
      }
    } else {
      // Navigating away from live — always pause
      if (!a.paused) {
        a.pause()
        setState('paused')
      }
    }
  }, [active])

  // Pause when parent signals (e.g., user made a choice)
  useEffect(() => {
    if (pauseSignal == null) return
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setState('paused')
    }
  }, [pauseSignal])

  const handleClick = useCallback(async () => {
    if (state === 'loading') return
    if (state === 'playing' && audioRef.current) {
      audioRef.current.pause()
      setState('paused')
      return
    }
    if (audioRef.current) {
      try {
        await audioRef.current.play()
        setState('playing')
      } catch {
        setState('blocked')
      }
    }
  }, [state])

  const cls = [
    'narration-btn',
    state === 'playing' && 'playing',
    state === 'blocked' && 'blocked',
    state === 'error' && 'error',
  ].filter(Boolean).join(' ')

  const isPlaying = state === 'playing'

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
      className={cls}
    >
      {isPlaying ? (
        <svg viewBox="0 0 24 24">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  )
}
