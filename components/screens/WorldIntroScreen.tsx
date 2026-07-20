'use client'
import { useApp } from '@/lib/context'
import { getLang } from '@/lib/lang'
import { IntroCarousel, type IntroSlide } from './IntroCarousel'

// Creator House intro — three full-bleed cinematic title cards (villa → the room
// that's always watching → your story), player-forward framing ("Feed pe naam
// banega ya bikhrega — tum decide karoge"). Rendered after world-select (from the
// Worlds hub, or after the name step on a fresh run); the CTA routes into the first
// beat (or resumes an in-progress run).

const SLIDES_HI: IntroSlide[] = [
  { img: '/avatars/seed-villa.png', eyebrow: 'Creator House · Season 1', title: 'Chhe creators. Ek villa. Das din.' },
  { img: '/avatars/scene-terrace-night.png', eyebrow: 'Sab dekh rahe hain', title: 'Yahan dosti bhi content hai.' },
  { img: '/avatars/scene-challenge.png', eyebrow: 'Tumhari story', title: 'Feed pe naam banega ya bikhrega — tum decide karoge.' },
]
const SLIDES_EN: IntroSlide[] = [
  { img: '/avatars/seed-villa.png', eyebrow: 'Creator House · Season 1', title: 'Six creators. One villa. Ten days.' },
  { img: '/avatars/scene-terrace-night.png', eyebrow: 'Everyone is watching', title: 'Here even friendship is content.' },
  { img: '/avatars/scene-challenge.png', eyebrow: 'Your story', title: 'Fame or flame-out on the feed — you decide.' },
]

export default function WorldIntroScreen() {
  const { startGame, navigate, game } = useApp()

  // Resume an in-progress Creator House run — startGame would wipe it. Land on the
  // Feed (the world hub); Live is entered from its banner.
  const enter = () => {
    if (game.world === 'creator-house' && game.situation > 0 && game.char) navigate('feed', { silent: true })
    else startGame()
  }

  return (
    <IntroCarousel
      slides={getLang() === 'en' ? SLIDES_EN : SLIDES_HI}
      accent="var(--accent)"
      ctaGradient="linear-gradient(120deg,#ff2d78,#c01a5a)"
      ctaShadow="rgba(255,45,120,.4)"
      cta="Enter the villa →"
      onEnter={enter}
    />
  )
}
