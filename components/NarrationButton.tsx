'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { audioHashBrowser } from '@/lib/voice'
import { ensureSession } from '@/lib/game'

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

  // Load audio when text changes. Wait for user to press play.
  useEffect(() => {
    let cancelled = false
    cleanup()
    setState('loading')

    ;(async () => {
      try {
        // Static-first: pre-generated clips are committed to public/audio and
        // served straight from the CDN — no serverless call, no API key needed.
        // Only fall back to the TTS route for text that isn't already cached.
        const hash = await audioHashBrowser(text)
        let res = await fetch(`/audio/${hash}.mp3`)
        if (!res.ok) {
          // Send the session token (works from a bundled Capacitor origin where
          // cookies don't carry) and an absolute API base when bundled.
          const session = await ensureSession()
          const apiBase = process.env.NEXT_PUBLIC_API_BASE || ''
          res = await fetch(`${apiBase}/api/narrate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
            },
            body: JSON.stringify({ text }),
          })
        }
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

        if (!cancelled) setState('paused')
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

  // React to active toggling: pause when navigating away
  useEffect(() => {
    activeRef.current = active
    const a = audioRef.current
    if (!a) return

    if (!active && !a.paused) {
      a.pause()
      setState('paused')
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
