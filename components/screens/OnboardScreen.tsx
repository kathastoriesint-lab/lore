'use client'
import { useState, useCallback } from 'react'
import { useApp } from '@/lib/context'

const LoreMark = () => (
  <svg viewBox="0 0 88 88" fill="none" width="80" height="80">
    <defs>
      <linearGradient id="og1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ff2d78"/>
        <stop offset=".5" stopColor="#ff8a3d"/>
        <stop offset="1" stopColor="#ffd24d"/>
      </linearGradient>
      <linearGradient id="og2" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffd24d"/>
        <stop offset="1" stopColor="#ff2d78" stopOpacity=".2"/>
      </linearGradient>
    </defs>
    <circle cx="44" cy="44" r="40" stroke="url(#og1)" strokeWidth="3.5"
      strokeDasharray="60 20 30 15 45 20" strokeLinecap="round" fill="none"
      style={{ transformOrigin:'44px 44px', animation:'loreSpin 12s linear infinite' }}/>
    <circle cx="44" cy="44" r="30" stroke="url(#og2)" strokeWidth="2"
      strokeDasharray="35 10 20 8" strokeLinecap="round" fill="none" opacity=".65"
      style={{ transformOrigin:'44px 44px', animation:'loreCounterSpin 20s linear infinite' }}/>
    <circle cx="44" cy="44" r="18" stroke="#ff2d78" strokeWidth="2.2" fill="none"/>
    <circle cx="44" cy="44" r="5.5" fill="#ffd24d"
      style={{ transformOrigin:'44px 44px', animation:'lorePulse 2.4s ease-in-out infinite' }}/>
  </svg>
)

export default function OnboardScreen() {
  const { navigate, showToast } = useApp()
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleEnter = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed) { showToast('Apna naam toh batao 🙏'); return }
    if (trimmed.length > 30) { showToast('Thoda chhota naam rakh yaar'); return }
    localStorage.setItem('lore_player_name', trimmed)
    setSubmitted(true)
    setTimeout(() => navigate('worlds'), 400)
  }, [name, navigate, showToast])

  return (
    <div className="onboard-screen">
      {/* Glow */}
      <div className="onboard-glow" />

      {/* Logo */}
      <div className="onboard-logo-wrap">
        <LoreMark />
        <div className="onboard-wordmark">Lore</div>
        <div className="onboard-tagline">Enter the world.<br />Shape what happens.</div>
      </div>

      {/* Form */}
      <div className={`onboard-form${submitted ? ' submitted' : ''}`}>
        <div className="onboard-form-lbl">What should the characters call you?</div>
        <input
          className="onboard-input"
          type="text"
          placeholder="Your name"
          value={name}
          maxLength={30}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleEnter()}
          autoFocus
        />
        <button
          className="onboard-cta"
          onClick={handleEnter}
          disabled={!name.trim() || submitted}
        >
          {submitted ? 'Entering...' : 'Enter the world →'}
        </button>
        <div className="onboard-hint">No signup needed. Your name makes the DMs personal.</div>
      </div>
    </div>
  )
}
