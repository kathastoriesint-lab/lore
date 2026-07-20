'use client'
import { useApp } from '@/lib/context'
import { getLang } from '@/lib/lang'
import { IntroCarousel, type IntroSlide } from './IntroCarousel'

// Cricket intro — three full-bleed cinematic title cards (Wankhede → the dressing
// room that's watching → your story), player-forward framing ("Sheet pe naam aayega
// ya nahi — tum decide karoge"). Rendered after world-select; the CTA routes into
// the first beat (or resumes an in-progress run / name-entry on a fresh player).

const SLIDES_HI: IntroSlide[] = [
  { img: '/avatars/cricket-wankhede.png', eyebrow: 'Mumbai Indians · Season 1', title: 'Solah saal. Ek contract.' },
  { img: '/avatars/cricket-dressing-room.png', eyebrow: 'Indian Dressing Room', title: 'Room asli hai. Nazrein bhi.' },
  { img: '/avatars/cricket-nets.png', eyebrow: 'Tumhari story', title: 'Sheet pe naam aayega ya nahi — tum decide karoge.' },
]
const SLIDES_EN: IntroSlide[] = [
  { img: '/avatars/cricket-wankhede.png', eyebrow: 'Mumbai Indians · Season 1', title: 'Sixteen years old. One contract.' },
  { img: '/avatars/cricket-dressing-room.png', eyebrow: 'Indian Dressing Room', title: 'The room is real. So are the eyes on you.' },
  { img: '/avatars/cricket-nets.png', eyebrow: 'Your story', title: 'Your name on the team sheet — or not. You decide.' },
]

export default function CricketCarouselScreen() {
  const { navigate, game, startCricketGame } = useApp()

  const enter = () => {
    // Resume an in-progress run — startCricketGame would wipe it. Land on the Feed
    // (the world hub); Live is entered from its banner.
    if (game.world === 'cricket' && game.situation > 0) navigate('feed', { silent: true })
    else if (game.playerName) startCricketGame()
    else {
      // Fresh player: remember they came from cricket so name-entry flows straight
      // into the game (saveProfile reads this) instead of bouncing back to Worlds.
      if (typeof window !== 'undefined') localStorage.setItem('lore_pending_world', 'cricket')
      navigate('onboarding')
    }
  }

  return (
    <IntroCarousel
      slides={getLang() === 'en' ? SLIDES_EN : SLIDES_HI}
      accent="var(--fame)"
      ctaGradient="linear-gradient(120deg,#003087,#001a5a)"
      ctaShadow="rgba(0,48,135,.55)"
      cta="Enter the dressing room →"
      onEnter={enter}
    />
  )
}
