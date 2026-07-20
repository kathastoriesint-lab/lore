'use client'
// App language — 'hi' is the native Hinglish experience (default), 'en' is the
// full-English variant (YC partners / non-Hindi readers). The preference decides
// which content bundle the loader serves and how the AI characters speak.
// Persisted in localStorage; content accessors read at boot/world-entry, so a
// change applies on the next reload (setLang callers reload when appropriate).

export type AppLang = 'hi' | 'en'

const LS_KEY = 'weev_lang'

export function getLang(): AppLang {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(LS_KEY) === 'en') return 'en'
  } catch { /* private mode */ }
  return 'hi'
}

export function setLang(lang: AppLang) {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(LS_KEY, lang) } catch { /* private mode */ }
}

/** Pick the copy for the active language: tr('Samajh gaya', 'Got it').
 *  Reads the preference at call time — components re-render on navigation, and
 *  a language change reloads the app, so no reactivity plumbing is needed. */
export function tr(hi: string, en: string): string {
  return getLang() === 'en' ? en : hi
}
